/**
 * Central app configuration.
 *
 * Single source of truth for the backend address. Previously every screen
 * hard-coded its own IP (10.0.21.50 / 192.168.0.103…), which drifted out of
 * sync. Change it ONCE here.
 */
import axios from "axios";

// LAN address of the Node/SAP proxy (backend/server.js, port 3001).
export const API_BASE = "http://10.0.21.50:3001";

/** Shared axios instance — sane timeout + base URL. */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

export const APP_VERSION = "2.0.0";
export const APP_DEPT = "Maintenance Dept.";
