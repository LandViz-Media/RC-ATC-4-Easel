// Responsibility: Store and retrieve machine/job settings in browser localStorage.
const KEY="easel-masso-atc-settings"; const defaults={startingToolConfirmed:false,parkX:4,parkY:0,parkZ:0,setterX:.315,setterY:.273,dustShoeEnabled:true,endMode:"park",endX:"",endY:"",endZOverrideEnabled:false,endZ:0};
export function loadSettings(){try{return {...defaults,...(JSON.parse(localStorage.getItem(KEY))||{})}}catch{return {...defaults}}}
export function saveSettings(s){localStorage.setItem(KEY,JSON.stringify(s))}
