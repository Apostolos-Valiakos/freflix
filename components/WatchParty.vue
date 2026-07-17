<template>
  <div>
    <v-btn
      v-if="!partyRoom"
      fab
      dark
      color="red"
      class="watch-party-fab"
      @click="startParty"
    >
      <v-icon>mdi-account-multiple</v-icon>
    </v-btn>

    <div
      v-else
      ref="panel"
      class="watch-party-panel"
      :class="{ minimized: isMinimized }"
      :style="panelStyle"
    >
      <div
        class="watch-party-header"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <span class="watch-party-title">Watch Party ({{ participantCount }})</span>
        <div class="watch-party-header-actions">
          <v-btn icon x-small dark @click.stop="copyInviteLink">
            <v-icon small>mdi-content-copy</v-icon>
          </v-btn>
          <v-btn icon x-small dark @click.stop="toggleMinimize">
            <v-icon small>{{
              isMinimized ? "mdi-window-maximize" : "mdi-window-minimize"
            }}</v-icon>
          </v-btn>
          <v-btn icon x-small dark @click.stop="leaveParty">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-show="!isMinimized" class="watch-party-body">
        <p v-if="statusMessage" class="watch-party-status">
          {{ statusMessage }}
        </p>
        <div class="video-grid">
          <WatchPartyVideoTile :stream="localStream" muted label="You" />
          <WatchPartyVideoTile
            v-for="(stream, peerId) in remoteStreams"
            :key="peerId"
            :stream="stream"
            :label="'Guest ' + peerId.slice(-4)"
          />
        </div>
        <div class="watch-party-controls">
          <v-btn icon dark small @click="toggleMic">
            <v-icon>{{ micEnabled ? "mdi-microphone" : "mdi-microphone-off" }}</v-icon>
          </v-btn>
          <v-btn icon dark small @click="toggleCamera">
            <v-icon>{{ cameraEnabled ? "mdi-video" : "mdi-video-off" }}</v-icon>
          </v-btn>
          <v-btn icon dark small color="red" @click="leaveParty">
            <v-icon>mdi-phone-hangup</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <v-snackbar v-model="showCopiedSnackbar" timeout="2000" color="red">
      Invite link copied!
    </v-snackbar>
  </div>
</template>

<script>
import WatchPartyVideoTile from "./WatchPartyVideoTile.vue";

let peerScriptPromise = null;
function loadPeer() {
  if (window.Peer) return Promise.resolve(window.Peer);
  if (!peerScriptPromise) {
    peerScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/peerjs.min.js";
      script.async = true;
      script.onload = () => resolve(window.Peer);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return peerScriptPromise;
}

const MAX_PARTICIPANTS = 6;

function generateRoomToken() {
  if (window.crypto && window.crypto.randomUUID) {
    return "freflix-" + window.crypto.randomUUID();
  }
  return (
    "freflix-" + Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
}

export default {
  components: { WatchPartyVideoTile },
  data() {
    return {
      partyRoom: null,
      isMinimized: false,
      peer: null,
      activeCalls: {},
      remoteStreams: {},
      localStream: null,
      statusMessage: "",
      micEnabled: true,
      cameraEnabled: true,
      showCopiedSnackbar: false,
      position: { top: null, left: null },
      dragOffset: { x: 0, y: 0 },
      isDragging: false,
    };
  },
  computed: {
    participantCount() {
      return Object.keys(this.remoteStreams).length + 1;
    },
    panelStyle() {
      if (this.position.top === null) return {};
      return {
        top: this.position.top + "px",
        left: this.position.left + "px",
        right: "auto",
        bottom: "auto",
      };
    },
  },
  mounted() {
    const roomFromUrl = this.$route.query.party;
    if (roomFromUrl) {
      this.joinParty(roomFromUrl);
    }
    window.addEventListener("mousemove", this.onDrag);
    window.addEventListener("mouseup", this.stopDrag);
    window.addEventListener("touchmove", this.onDrag, { passive: false });
    window.addEventListener("touchend", this.stopDrag);
  },
  beforeDestroy() {
    this.cleanup();
    window.removeEventListener("mousemove", this.onDrag);
    window.removeEventListener("mouseup", this.stopDrag);
    window.removeEventListener("touchmove", this.onDrag);
    window.removeEventListener("touchend", this.stopDrag);
  },
  methods: {
    async startParty() {
      const room = generateRoomToken();
      this.$router.replace({ query: { ...this.$route.query, party: room } });
      this.partyRoom = room;
      this.statusMessage = "Setting up...";
      try {
        await this.setupMedia();
        const Peer = await loadPeer();
        this.peer = new Peer(room + "-host");
        this.attachPeerListeners();
        this.peer.on("open", () => {
          this.statusMessage =
            "Waiting for people to join — share the invite link!";
        });
        this.peer.on("connection", (conn) => {
          conn.on("open", () => {
            if (Object.keys(this.activeCalls).length >= MAX_PARTICIPANTS - 1) {
              conn.send({ type: "full" });
              return;
            }
            conn.send({ type: "roster", peers: Object.keys(this.activeCalls) });
          });
        });
      } catch (err) {
        console.error(err);
        this.statusMessage = err.message || "Could not access camera/microphone.";
      }
    },
    async joinParty(room) {
      this.partyRoom = room;
      this.statusMessage = "Connecting...";
      try {
        await this.setupMedia();
        const Peer = await loadPeer();
        this.peer = new Peer();
        this.attachPeerListeners();
        this.peer.on("open", () => {
          const conn = this.peer.connect(room + "-host");
          conn.on("data", (data) => this.handleHostResponse(data, room));
        });
      } catch (err) {
        console.error(err);
        this.statusMessage = err.message || "Could not access camera/microphone.";
      }
    },
    attachPeerListeners() {
      this.peer.on("call", (call) => {
        call.answer(this.localStream);
        this.registerCall(call.peer, call);
      });
      this.peer.on("error", (err) => {
        console.error(err);
        this.statusMessage = "Connection error (" + err.type + ")";
      });
    },
    handleHostResponse(data, room) {
      if (data.type === "full") {
        this.statusMessage = "This watch party is full (max " + MAX_PARTICIPANTS + " people).";
        this.cleanup();
        return;
      }
      if (data.type !== "roster") return;

      const hostCall = this.peer.call(room + "-host", this.localStream);
      this.registerCall(room + "-host", hostCall);

      data.peers.forEach((peerId) => {
        if (peerId !== this.peer.id && !this.activeCalls[peerId]) {
          const call = this.peer.call(peerId, this.localStream);
          this.registerCall(peerId, call);
        }
      });
    },
    registerCall(peerId, call) {
      this.activeCalls = { ...this.activeCalls, [peerId]: call };
      call.on("stream", (remoteStream) => {
        this.statusMessage = "";
        this.$set(this.remoteStreams, peerId, remoteStream);
      });
      call.on("close", () => this.removePeer(peerId));
      call.on("error", (err) => console.error(err));
    },
    removePeer(peerId) {
      this.$delete(this.remoteStreams, peerId);
      delete this.activeCalls[peerId];
    },
    async setupMedia() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera/mic access requires a secure connection (https:// or localhost). " +
            "If you're testing over a plain http:// LAN address, enable " +
            "chrome://flags/#unsafely-treat-insecure-origin-as-secure for this exact origin and relaunch the browser."
        );
      }
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    },
    toggleMic() {
      if (!this.localStream) return;
      this.micEnabled = !this.micEnabled;
      this.localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = this.micEnabled));
    },
    toggleCamera() {
      if (!this.localStream) return;
      this.cameraEnabled = !this.cameraEnabled;
      this.localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = this.cameraEnabled));
    },
    cleanup() {
      Object.values(this.activeCalls).forEach((call) => call.close());
      this.activeCalls = {};
      this.remoteStreams = {};
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
        this.localStream = null;
      }
    },
    leaveParty() {
      this.cleanup();
      this.partyRoom = null;
      this.isMinimized = false;
      this.statusMessage = "";
      const query = { ...this.$route.query };
      delete query.party;
      this.$router.replace({ query });
    },
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
    },
    async copyInviteLink() {
      const url = window.location.href;
      try {
        await navigator.clipboard.writeText(url);
        this.showCopiedSnackbar = true;
      } catch (err) {
        window.prompt("Copy this link to invite someone:", url);
      }
    },
    startDrag(event) {
      this.isDragging = true;
      const point = event.touches ? event.touches[0] : event;
      const rect = this.$refs.panel.getBoundingClientRect();
      this.dragOffset = {
        x: point.clientX - rect.left,
        y: point.clientY - rect.top,
      };
      event.preventDefault();
    },
    onDrag(event) {
      if (!this.isDragging) return;
      const point = event.touches ? event.touches[0] : event;
      this.position = {
        left: point.clientX - this.dragOffset.x,
        top: point.clientY - this.dragOffset.y,
      };
      event.preventDefault();
    },
    stopDrag() {
      this.isDragging = false;
    },
  },
};
</script>

<style scoped>
.watch-party-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 3000;
}

.watch-party-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 420px;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.watch-party-panel.minimized {
  height: auto;
}

.watch-party-header {
  background: #d32f2f;
  color: white;
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
}

.watch-party-title {
  font-weight: bold;
  font-size: 0.9rem;
}

.watch-party-header-actions {
  display: flex;
  gap: 2px;
}

.watch-party-body {
  padding: 8px;
}

.watch-party-status {
  color: #ccc;
  font-size: 0.8rem;
  text-align: center;
  margin-bottom: 8px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
}

.watch-party-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 8px;
}

@media (max-width: 599px) {
  .watch-party-panel {
    width: calc(100vw - 32px);
  }
}
</style>
