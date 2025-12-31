import { environment } from "../env/environment";

export const API_BASE = environment.apiBase;
console.log('ENV', environment.production, environment.apiBase);