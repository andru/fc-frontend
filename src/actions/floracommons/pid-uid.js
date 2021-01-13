import pidMap from "../../constants/pids.js";

const uidMap = Object.assign({}, ...Object.entries(pidMap).map(([a,b]) => ({ [b]: a })))

export function getPID (uid) {
  if (pidMap[uid]) {
    return pidMap[uid];
  }
  throw new Error(`No PID found for UID ${uid}`);
}
export function getUID (pid) {
  if (uidMap[pid]) {
    return uidMap[pid];
  }
  throw new Error(`No PID found for UID ${pid}`);
} 