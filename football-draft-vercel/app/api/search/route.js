import {fetchPage,parseSearch} from '../shared';
export const runtime='nodejs';
export async function GET(req){const q=new URL(req.url).searchParams.get('q')?.trim()||'';if(q.length<2||q.length>80)return Response.json({ok:true,players:[]});try{const html=await fetchPage('https://www.transfermarkt.pt/schnellsuche/ergebnis/schnellsuche?query='+encodeURIComponent(q));return Response.json({ok:true,players:parseSearch(html)},{headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=600'}})}catch(e){return Response.json({ok:false,error:e.message,players:[]},{status:502})}}
