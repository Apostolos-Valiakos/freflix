<template>
  <div>
    <div
      v-if="partyRoom"
      ref="panel"
      class="fixed bottom-24 right-4 z-[60] flex w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border border-white/15 bg-[#111] shadow-2xl sm:w-[420px] lg:right-8"
      :style="panelStyle"
    >
      <div
        class="flex cursor-move select-none items-center justify-between bg-accent px-2.5 py-1.5"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <span class="text-sm font-bold">Watch Party ({{ participantCount }})</span>
        <div class="flex gap-0.5">
          <button class="party-icon" aria-label="Copy invite link" @click.stop="copyInviteLink">
            <Copy class="h-4 w-4" />
          </button>
          <button class="party-icon" aria-label="Minimize" @click.stop="isMinimized = !isMinimized">
            <Maximize2 v-if="isMinimized" class="h-4 w-4" />
            <Minus v-else class="h-4 w-4" />
          </button>
          <button class="party-icon" aria-label="Leave party" @click.stop="leaveParty">
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div v-show="!isMinimized" class="p-2">
        <p v-if="statusMessage" class="mb-2 text-center text-xs text-white/70">
          {{ statusMessage }}
        </p>
        <div
          class="grid max-h-80 grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-1 overflow-y-auto"
        >
          <WatchPartyVideoTile :stream="localStream" muted label="You" />
          <WatchPartyVideoTile
            v-for="(stream, peerId) in remoteStreams"
            :key="peerId"
            :stream="stream"
            :label="'Guest ' + String(peerId).slice(-4)"
          />
        </div>
        <div class="flex justify-center gap-3 pt-2">
          <button class="party-control" aria-label="Toggle microphone" @click="toggleMic">
            <Mic v-if="micEnabled" class="h-5 w-5" />
            <MicOff v-else class="h-5 w-5" />
          </button>
          <button class="party-control" aria-label="Toggle camera" @click="toggleCamera">
            <Video v-if="cameraEnabled" class="h-5 w-5" />
            <VideoOff v-else class="h-5 w-5" />
          </button>
          <button class="party-control text-accent-hot" aria-label="Hang up" @click="leaveParty">
            <PhoneOff class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="showCopied"
        class="fixed bottom-28 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold shadow-lg lg:bottom-10"
      >
        Invite link copied!
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  Copy,
  Maximize2,
  Mic,
  MicOff,
  Minus,
  PhoneOff,
  Video,
  VideoOff,
  X,
} from "lucide-vue-next";

const MAX_PARTICIPANTS = 6;

let peerScriptPromise: Promise<any> | null = null;
function loadPeer(): Promise<any> {
  const w = window as any;
  if (w.Peer) return Promise.resolve(w.Peer);
  if (!peerScriptPromise) {
    peerScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/peerjs.min.js";
      script.async = true;
      script.onload = () => resolve(w.Peer);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return peerScriptPromise;
}

function generateRoomToken() {
  if (window.crypto && window.crypto.randomUUID) {
    return "freflix-" + window.crypto.randomUUID();
  }
  return (
    "freflix-" + Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
}

const route = useRoute();
const router = useRouter();

const partyRoom = ref<string | null>(null);
const isMinimized = ref(false);
const remoteStreams = ref<Record<string, MediaStream>>({});
const localStream = shallowRef<MediaStream | null>(null);
const statusMessage = ref("");
const micEnabled = ref(true);
const cameraEnabled = ref(true);
const showCopied = ref(false);
const position = ref<{ top: number | null; left: number | null }>({
  top: null,
  left: null,
});
const panel = ref<HTMLElement | null>(null);

// PeerJS objects are kept out of Vue's reactivity on purpose
let peer: any = null;
let activeCalls: Record<string, any> = {};
let dragOffset = { x: 0, y: 0 };
let isDragging = false;

const participantCount = computed(
  () => Object.keys(remoteStreams.value).length + 1
);
const panelStyle = computed(() => {
  if (position.value.top === null) return {};
  return {
    top: position.value.top + "px",
    left: position.value.left + "px",
    right: "auto",
    bottom: "auto",
  };
});

async function startParty() {
  const room = generateRoomToken();
  router.replace({ query: { ...route.query, party: room } });
  partyRoom.value = room;
  statusMessage.value = "Setting up...";
  try {
    await setupMedia();
    const Peer = await loadPeer();
    peer = new Peer(room + "-host");
    attachPeerListeners();
    peer.on("open", () => {
      statusMessage.value =
        "Waiting for people to join — share the invite link!";
    });
    peer.on("connection", (conn: any) => {
      conn.on("open", () => {
        if (Object.keys(activeCalls).length >= MAX_PARTICIPANTS - 1) {
          conn.send({ type: "full" });
          return;
        }
        conn.send({ type: "roster", peers: Object.keys(activeCalls) });
      });
    });
  } catch (err: any) {
    console.error(err);
    statusMessage.value = err.message || "Could not access camera/microphone.";
  }
}

async function joinParty(room: string) {
  partyRoom.value = room;
  statusMessage.value = "Connecting...";
  try {
    await setupMedia();
    const Peer = await loadPeer();
    peer = new Peer();
    attachPeerListeners();
    peer.on("open", () => {
      const conn = peer.connect(room + "-host");
      conn.on("data", (data: any) => handleHostResponse(data, room));
    });
  } catch (err: any) {
    console.error(err);
    statusMessage.value = err.message || "Could not access camera/microphone.";
  }
}

function attachPeerListeners() {
  peer.on("call", (call: any) => {
    call.answer(localStream.value);
    registerCall(call.peer, call);
  });
  peer.on("error", (err: any) => {
    console.error(err);
    statusMessage.value = "Connection error (" + err.type + ")";
  });
}

function handleHostResponse(data: any, room: string) {
  if (data.type === "full") {
    statusMessage.value =
      "This watch party is full (max " + MAX_PARTICIPANTS + " people).";
    cleanup();
    return;
  }
  if (data.type !== "roster") return;

  const hostCall = peer.call(room + "-host", localStream.value);
  registerCall(room + "-host", hostCall);

  data.peers.forEach((peerId: string) => {
    if (peerId !== peer.id && !activeCalls[peerId]) {
      const call = peer.call(peerId, localStream.value);
      registerCall(peerId, call);
    }
  });
}

function registerCall(peerId: string, call: any) {
  activeCalls = { ...activeCalls, [peerId]: call };
  call.on("stream", (remoteStream: MediaStream) => {
    statusMessage.value = "";
    remoteStreams.value = { ...remoteStreams.value, [peerId]: markRaw(remoteStream) };
  });
  call.on("close", () => removePeer(peerId));
  call.on("error", (err: any) => console.error(err));
}

function removePeer(peerId: string) {
  const { [peerId]: _removed, ...rest } = remoteStreams.value;
  remoteStreams.value = rest;
  delete activeCalls[peerId];
}

async function setupMedia() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Camera/mic access requires a secure connection (https:// or localhost). " +
        "If you're testing over a plain http:// LAN address, enable " +
        "chrome://flags/#unsafely-treat-insecure-origin-as-secure for this exact origin and relaunch the browser."
    );
  }
  localStream.value = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
}

function toggleMic() {
  if (!localStream.value) return;
  micEnabled.value = !micEnabled.value;
  localStream.value
    .getAudioTracks()
    .forEach((track) => (track.enabled = micEnabled.value));
}

function toggleCamera() {
  if (!localStream.value) return;
  cameraEnabled.value = !cameraEnabled.value;
  localStream.value
    .getVideoTracks()
    .forEach((track) => (track.enabled = cameraEnabled.value));
}

function cleanup() {
  Object.values(activeCalls).forEach((call) => call.close());
  activeCalls = {};
  remoteStreams.value = {};
  if (peer) {
    peer.destroy();
    peer = null;
  }
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop());
    localStream.value = null;
  }
}

function leaveParty() {
  cleanup();
  partyRoom.value = null;
  isMinimized.value = false;
  statusMessage.value = "";
  position.value = { top: null, left: null };
  const query = { ...route.query };
  delete query.party;
  router.replace({ query });
}

async function copyInviteLink() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    showCopied.value = true;
    setTimeout(() => (showCopied.value = false), 2000);
  } catch {
    window.prompt("Copy this link to invite someone:", url);
  }
}

function pointOf(event: MouseEvent | TouchEvent) {
  return "touches" in event ? event.touches[0]! : event;
}

function startDrag(event: MouseEvent | TouchEvent) {
  if (!panel.value) return;
  isDragging = true;
  const point = pointOf(event);
  const rect = panel.value.getBoundingClientRect();
  dragOffset = { x: point.clientX - rect.left, y: point.clientY - rect.top };
  event.preventDefault();
}

function onDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging) return;
  const point = pointOf(event);
  position.value = {
    left: point.clientX - dragOffset.x,
    top: point.clientY - dragOffset.y,
  };
  event.preventDefault();
}

function stopDrag() {
  isDragging = false;
}

defineExpose({ startParty, partyRoom });

onMounted(() => {
  const roomFromUrl = route.query.party;
  if (typeof roomFromUrl === "string" && roomFromUrl) {
    joinParty(roomFromUrl);
  }
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("touchmove", onDrag, { passive: false });
  window.addEventListener("touchend", stopDrag);
});

onBeforeUnmount(() => {
  cleanup();
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
  window.removeEventListener("touchmove", onDrag);
  window.removeEventListener("touchend", stopDrag);
});
</script>

<style scoped>
@reference "~/assets/css/main.css";

.party-icon {
  @apply grid h-7 w-7 place-items-center rounded-full text-white transition hover:bg-black/20;
}

.party-control {
  @apply grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10;
}
</style>
