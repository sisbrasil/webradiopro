import { Stream } from './types';

// Replace with your actual WhatsApp number (country code + area code + number, no symbols)
export const WHATSAPP_NUMBER = "5511999999999";

export const STREAMS: Stream[] = [
  {
    id: "stream-main",
    name: "Rádio Principal",
    // Example working stream. Replace with your own.
    url: "https://stream.zeno.fm/cldwactvjlgtv", 
    cover: "https://picsum.photos/id/1/800/800",
    desc: "Os maiores sucessos 24h",
  },
  {
    id: "stream-alt",
    name: "Canal Flashback",
    // Using the same URL for demo purposes, replace with actual alternate stream
    url: "https://stream.zeno.fm/cldwactvjlgtv", 
    cover: "https://picsum.photos/id/39/800/800",
    desc: "O melhor dos anos 80 e 90",
  },
];
