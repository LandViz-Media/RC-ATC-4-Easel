// Responsibility: Store and retrieve machine settings in browser localStorage.
const KEY="easel-masso-atc-settings";
const defaults={startingTool:0,parkX:0,parkY:0,parkZ:2,setterX:.315,setterY:.273,dustShoeEnabled:true};
export function loadSettings(){try{return{...defaults,...(JSON.parse(localStorage.getItem(KEY))||{})}}catch{return{...defaults}}}
export function saveSettings(settings){localStorage.setItem(KEY,JSON.stringify(settings))}