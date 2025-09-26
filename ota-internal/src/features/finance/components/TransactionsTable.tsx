import React, { useMemo, useState } from 'react';
import { useFinanceCore } from '../core/finance-core';

interface Row { id:string; date:string; category:string; type:string; amount:number; description?:string }

const ROW_HEIGHT = 40;

export const TransactionsTable: React.FC<{ height?: number }> = ({ height=320 }) => {
  const { snapshot } = useFinanceCore();
  const data: Row[] = useMemo(()=> (snapshot?.expenses || []).map(e => ({
    id: e.id,
    date: e.date,
    category: e.category,
    type: e.type,
    amount: e.type==='expense' ? -e.amount : e.amount,
    description: e.description
  })), [snapshot]);
  const [scrollTop, setScrollTop] = useState(0);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => setScrollTop(e.currentTarget.scrollTop);
  const viewportCount = Math.ceil(height / ROW_HEIGHT) + 4;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);
  const slice = data.slice(start, start + viewportCount);

  return (
    <div style={{background:'var(--color-surface)',borderRadius:12,padding:8}}>
      <div style={{display:'flex',fontSize:12,opacity:0.6,padding:'4px 8px'}}>
        <div style={{flex:'0 0 90px'}}>Date</div>
        <div style={{flex:'0 0 110px'}}>Category</div>
        <div style={{flex:'0 0 80px'}}>Type</div>
        <div style={{flex:'1 1 auto'}}>Description</div>
        <div style={{flex:'0 0 110px',textAlign:'right'}}>Amount</div>
      </div>
      <div style={{height,overflow:'auto',position:'relative'}} onScroll={onScroll}>
        <div style={{height: data.length * ROW_HEIGHT, position:'relative'}}>
          {slice.map((r,i) => {
            const absoluteIndex = start + i;
            return (
              <div key={r.id} style={{position:'absolute',top: (absoluteIndex*ROW_HEIGHT),left:0,right:0,height:ROW_HEIGHT,display:'flex',alignItems:'center',padding:'0 8px',fontSize:13,borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{flex:'0 0 90px'}}>{r.date}</div>
                <div style={{flex:'0 0 110px'}}>{r.category}</div>
                <div style={{flex:'0 0 80px',color: r.type==='income' ? 'var(--finance-positive)' : 'var(--finance-negative)'}}>{r.type}</div>
                <div style={{flex:'1 1 auto',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={r.description}>{r.description}</div>
                <div style={{flex:'0 0 110px',textAlign:'right',fontVariantNumeric:'tabular-nums',color: r.amount>=0?'var(--finance-positive)':'var(--finance-negative)'}}>{r.amount.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{fontSize:11,opacity:0.5,marginTop:4}}>{data.length} rows</div>
    </div>
  );
};

export default TransactionsTable;
