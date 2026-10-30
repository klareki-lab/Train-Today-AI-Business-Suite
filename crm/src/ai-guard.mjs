export function requireAi(key) {
 if(process.env.AI_ENABLED!=='1')throw Object.assign(new Error('KI ist lokal deaktiviert.'),{status:503});
 if(!key || !key.trim())throw Object.assign(new Error('KI-Zugang noch nicht eingerichtet.'),{status:503});
}
export async function aiFetch(url,options,key) {
 requireAi(key);
 return fetch(url,options);
}
