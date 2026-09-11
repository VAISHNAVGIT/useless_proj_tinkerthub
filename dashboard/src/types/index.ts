export const SystemState = {
  IDLE: 0,
  PERSON_DETECTED: 1,
  LID_OPEN: 2,
  WAITING_FOR_WASTE: 3,
  WASTE_DETECTED: 4,
  LID_CLOSING: 5,
  AWAITING_VERDICT: 6,
  REJECTING: 7,
  COMPLETE: 8,
  ERROR_STATE: 9,
} as const;

export type SystemState = typeof SystemState[keyof typeof SystemState];

export const StateNames: Record<number, string> = {
  [SystemState.IDLE]: "WAITING FOR WASTE",
  [SystemState.PERSON_DETECTED]: "HUMAN PRESENCE CONFIRMED",
  [SystemState.LID_OPEN]: "LID OPENED",
  [SystemState.WAITING_FOR_WASTE]: "WAITING FOR DEPOSIT",
  [SystemState.WASTE_DETECTED]: "OBJECT ACQUIRED",
  [SystemState.LID_CLOSING]: "LID CLOSING",
  [SystemState.AWAITING_VERDICT]: "AWAITING VERDICT",
  [SystemState.REJECTING]: "INITIATING WASTE REJECTION",
  [SystemState.COMPLETE]: "REJECTION COMPLETED",
  [SystemState.ERROR_STATE]: "CRITICAL ERROR"
};

export interface SystemStatus {
  connected: boolean;
  esp32Ip: string;
  distance: number;
  state: SystemState;
  lidOpen: boolean;
  rejectionOpen: boolean;
  uptime: number;
  rssi: number;
  simulationMode: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'cmd';
}

export interface AnalyticsData {
  totalVisitors: number;
  totalWasteAttempts: number;
  totalRejectedWaste: number;
  successfulClaims: number;
  failedClaims: number;
  averageUserPatienceSec: number;
  yesButtonEscapes: number;
}

export type WSCommand = 
  | 'REJECT_WASTE'
  | 'ACCEPT_WASTE'
  | 'OPEN_LID'
  | 'CLOSE_LID'
  | 'OPEN_REJECTION_DOOR'
  | 'CLOSE_REJECTION_DOOR'
  | 'SIMULATE_PERSON'
  | 'SIMULATE_WASTE'
  | 'RESET_SYSTEM'
  | 'PING';

export interface WSEventMessage {
  type: 'event' | 'status';
  event?: string;
  details?: string;
  timestamp?: number;
  distance?: number;
  state?: SystemState;
  lidOpen?: boolean;
  rejectionOpen?: boolean;
  uptime?: number;
  rssi?: number;
  ip?: string;
}
