 "use client";

import Link from "next/link";
import { useState } from "react";

type Row={name:string;price:string;affiliate:string};

export default function ShopeeImportPage(){
 const [rows,setRows]=useState<Row[]>([]);

 function parse(text:string){
  const lines=text.split(/\r?\n/).filter(Boolean);
  if(lines.length<2){setRows([]);return;}
  const headers=lines[0].split(",");
  const idx=(k:string)=>headers.findIndex(h=>h.toLowerCase().includes(k));
  const nameIdx=idx("nama");
  const priceIdx=idx("harga");
  const affIdx=headers.findIndex(h=>h.toLowerCase().includes("komisi ekstra"));
  const data:Row[]=[];
  for(const line of lines.slice(1)){
    const c=line.split(",");
    data.push({
      name:c[nameIdx]??"-",
      price:c[priceIdx]??"-",
      affiliate:c[affIdx]?"✓":"-"
    });
  }
  setRows(data);
 }

 return (
 <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-6xl">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-bold text-orange-600">BelanjaLab Admin</p>
 <h1 className="mt-1 text-3xl font-black">Shopee Affiliate Import</h1>
 <p className="mt-2 text-sm text-slate-500">Upload CSV Shopee Affiliate dan preview sebelum scan.</p>
 </div>
 <Link href="/admin" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">Kembali</Link>
 </div>

 <section className="mt-8 rounded-2xl border-2 border-dashed border-orange-300 bg-white p-10">
 <input type="file" accept=".csv"
 className="block w-full rounded-xl border border-slate-200 p-3"
 onChange={async(e)=>{
 const f=e.target.files?.[0];
 if(!f) return;
 parse(await f.text());
 }}/>
 <button disabled className="mt-6 w-full rounded-xl bg-slate-300 px-5 py-3 text-sm font-bold text-white">Scan Produk (Coming Soon)</button>
 </section>

 <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
 <h3 className="text-lg font-black">Preview ({rows.length} produk)</h3>
 <div className="mt-4 overflow-x-auto">
 <table className="min-w-full text-sm">
 <thead className="bg-slate-50">
 <tr>
 <th className="px-4 py-3 text-left">Nama Produk</th>
 <th className="px-4 py-3 text-left">Harga</th>
 <th className="px-4 py-3 text-left">Affiliate</th>
 </tr>
 </thead>
 <tbody>
 {rows.length===0?(
 <tr><td colSpan={3} className="px-4 py-6 text-slate-400">Belum ada file dipilih.</td></tr>
 ):rows.map((r,i)=>(
 <tr key={i} className="border-t">
 <td className="px-4 py-3">{r.name}</td>
 <td className="px-4 py-3">{r.price}</td>
 <td className="px-4 py-3">{r.affiliate}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>
 </div>
 </main>);
}
