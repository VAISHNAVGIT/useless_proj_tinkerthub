import { SystemState } from '../types';
import type { SystemStatus, WSCommand, WSEventMessage } from '../types';

type StatusCallback = (status: Partial<SystemStatus>) => void;
type EventCallback = (event: WSEventMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private esp32Ip: string = '192.168.1.42';
  private port: number = 81;
  private simulationMode: boolean = false;
  private reconnectTimer: number | null = null;
  private statusListeners: StatusCallback[] = [];
  private eventListeners: EventCallback[] = [];

  private currentStatus: SystemStatus = {
    connected: false,
    esp32Ip: '192.168.1.42',
    distance: 45,
    state: SystemState.IDLE,
    lidOpen: false,
    rejectionOpen: false,
    uptime: 0,
    rssi: -55,
    simulationMode: false,
  };

  public setIp(ip: string) {
    this.esp32Ip = ip;
    this.currentStatus.esp32Ip = ip;
    if (!this.simulationMode && this.ws) {
      this.disconnect();
      this.connect();
    }
  }

  public getIp(): string {
    return this.esp32Ip;
  }

  public setSimulationMode(enabled: boolean) {
    this.simulationMode = enabled;
    this.currentStatus.simulationMode = enabled;
    if (enabled) {
      this.disconnect();
      this.updateStatus({ connected: true });
    } else {
      this.connect();
    }
  }

  public isSimulationMode(): boolean {
    return this.simulationMode;
  }

  public connect() {
    if (this.simulationMode) {
      this.updateStatus({ connected: true });
      return;
    }

    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    const wsUrl = `ws://${this.esp32Ip}:${this.port}`;
    console.log(`[WebSocket] Connecting to ${wsUrl}...`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected!');
        this.updateStatus({ connected: true });
        if (this.reconnectTimer) {
          clearInterval(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WSEventMessage = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (e) {
          console.error('[WebSocket] Message parse error:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed.');
        this.updateStatus({ connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Error encountered:', err);
        this.updateStatus({ connected: false });
      };
    } catch (err) {
      console.error('[WebSocket] Exception during connect:', err);
      this.updateStatus({ connected: false });
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateStatus({ connected: false });
  }

  private scheduleReconnect() {
    if (this.simulationMode || this.reconnectTimer) return;
    this.reconnectTimer = window.setInterval(() => {
      console.log('[WebSocket] Attempting automatic reconnect...');
      this.connect();
    }, 4000);
  }

  public sendCommand(command: WSCommand, payload: Record<string, unknown> = {}) {
    console.log(`[WebSocket Command] Sent: ${command}`, payload);
    
    if (this.simulationMode) {
      this.handleSimulatedCommand(command);
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'command',
        command,
        id: crypto.randomUUID(),
        sentAt: Date.now(),
        ...payload,
      }));
    } else {
      console.warn('[WebSocket] Cannot send command: socket is disconnected.');
    }
  }

  private handleIncomingMessage(msg: WSEventMessage) {
    if (msg.distance !== undefined || msg.state !== undefined) {
      this.updateStatus({
        ...(msg.distance !== undefined && { distance: msg.distance }),
        ...(msg.state !== undefined && { state: msg.state }),
        ...(msg.lidOpen !== undefined && { lidOpen: msg.lidOpen }),
        ...(msg.rejectionOpen !== undefined && { rejectionOpen: msg.rejectionOpen }),
        ...(msg.uptime !== undefined && { uptime: msg.uptime }),
        ...(msg.rssi !== undefined && { rssi: msg.rssi }),
        ...(msg.ip && msg.ip !== 'not-connected' && { esp32Ip: msg.ip }),
      });
    }

    this.eventListeners.forEach((cb) => cb(msg));
  }

  private handleSimulatedCommand(command: WSCommand) {
    switch (command) {
      case 'OPEN_LID':
        this.updateStatus({ lidOpen: true, state: SystemState.LID_OPEN });
        this.notifyEvent({ type: 'event', event: 'LID_OPENED', details: 'Lid opened (Simulated)' });
        break;
      case 'CLOSE_LID':
        this.updateStatus({ lidOpen: false, state: SystemState.LID_CLOSING });
        this.notifyEvent({ type: 'event', event: 'LID_CLOSED', details: 'Lid closed (Simulated)' });
        break;
      case 'OPEN_REJECTION_DOOR':
        this.updateStatus({ rejectionOpen: true, state: SystemState.REJECTING });
        this.notifyEvent({ type: 'event', event: 'REJECTION_STARTED', details: 'Rejection door opened (Simulated)' });
        break;
      case 'CLOSE_REJECTION_DOOR':
        this.updateStatus({ rejectionOpen: false, state: SystemState.COMPLETE });
        this.notifyEvent({ type: 'event', event: 'REJECTION_COMPLETED', details: 'Rejection door closed (Simulated)' });
        break;
      case 'SIMULATE_PERSON':
        this.updateStatus({ distance: 18, state: SystemState.PERSON_DETECTED });
        this.notifyEvent({ type: 'event', event: 'OBJECT_DETECTED', details: 'Object/person detected at 18 cm' });
        this.notifyEvent({ type: 'event', event: 'LID_OPENING', details: 'Servo 1 opening' });
        setTimeout(() => {
          this.updateStatus({ lidOpen: true, state: SystemState.LID_OPEN });
          this.notifyEvent({ type: 'event', event: 'LID_OPENED', details: 'Lid opened automatically' });
          this.updateStatus({ state: SystemState.WAITING_FOR_WASTE });
        }, 600);
        setTimeout(() => {
          this.updateStatus({ state: SystemState.WASTE_DETECTED });
          this.notifyEvent({ type: 'event', event: 'WASTE_DETECTED', details: 'Waste deposit window ended' });
          this.notifyEvent({ type: 'event', event: 'LID_CLOSING', details: 'Servo 1 closing' });
        }, 3600);
        setTimeout(() => {
          this.updateStatus({ lidOpen: false, state: SystemState.AWAITING_VERDICT });
          this.notifyEvent({ type: 'event', event: 'LID_CLOSED', details: 'Lid closed automatically' });
          this.notifyEvent({ type: 'event', event: 'VERIFICATION_STARTED', details: 'Dashboard verdict required' });
        }, 4400);
        break;
      case 'SIMULATE_WASTE':
        this.updateStatus({ state: SystemState.WASTE_DETECTED });
        this.notifyEvent({ type: 'event', event: 'WASTE_DETECTED', details: 'Waste detected in bin container' });
        setTimeout(() => {
          this.updateStatus({ lidOpen: false, state: SystemState.AWAITING_VERDICT });
          this.notifyEvent({ type: 'event', event: 'VERIFICATION_STARTED', details: 'Lid closed. Verification prompt activated.' });
        }, 1200);
        break;
      case 'REJECT_WASTE':
        this.updateStatus({ lidOpen: false, state: SystemState.REJECTING });
        this.notifyEvent({ type: 'event', event: 'REJECTION_STARTED', details: 'Waste rejection protocol initiated' });
        setTimeout(() => {
          this.updateStatus({ rejectionOpen: true });
        }, 500);
        setTimeout(() => {
          this.updateStatus({ rejectionOpen: false, state: SystemState.COMPLETE });
          this.notifyEvent({ type: 'event', event: 'REJECTION_COMPLETED', details: 'Waste expelled. Door secured.' });
        }, 2500);
        setTimeout(() => {
          this.updateStatus({ state: SystemState.IDLE, distance: 45 });
          this.notifyEvent({ type: 'event', event: 'SYSTEM_READY', details: 'System reset to IDLE' });
        }, 4000);
        break;
      case 'RESET_SYSTEM':
        this.updateStatus({ lidOpen: false, rejectionOpen: false, state: SystemState.IDLE, distance: 45 });
        this.notifyEvent({ type: 'event', event: 'SYSTEM_READY', details: 'System reset to IDLE' });
        break;
    }
  }

  public updateStatus(partial: Partial<SystemStatus>) {
    this.currentStatus = { ...this.currentStatus, ...partial };
    this.statusListeners.forEach((cb) => cb(this.currentStatus));
  }

  private notifyEvent(event: WSEventMessage) {
    this.eventListeners.forEach((cb) => cb(event));
  }

  public subscribeStatus(cb: StatusCallback) {
    this.statusListeners.push(cb);
    cb(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== cb);
    };
  }

  public subscribeEvents(cb: EventCallback) {
    this.eventListeners.push(cb);
    return () => {
      this.eventListeners = this.eventListeners.filter((l) => l !== cb);
    };
  }
}

export const wsService = new WebSocketService();
