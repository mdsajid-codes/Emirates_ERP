import{r as o,j as r}from"./vendor-react-DYZogNSQ.js";import{F as Y,i as Z,a as ee,b as te}from"./vendor-calendar-fE3Cmnx-.js";import{a as p}from"./vendor-axios-B9ygI19o.js";import{a as F,m as re}from"./vendor-icons-JPUKHiZ6.js";import"./vendor-ckeditor-D7jZpAcx.js";const f="https://thegtrgroup.com/api",le=()=>{const R=o.useRef(null),[I,T]=o.useState([]),[L,S]=o.useState(!1),[d,G]=o.useState("Manufacturing Order"),[j,P]=o.useState({}),[x,q]=o.useState({}),[y,U]=o.useState({});o.useEffect(()=>{(async()=>{try{const i={headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}},[a,s,l]=await Promise.all([p.get(`${f}/production/finished-goods`,i),p.get(`${f}/parties`,{...i,params:{type:"CUSTOMER",size:1e3}}),p.get(`${f}/sales/orders`,{...i,params:{size:1e3}})]),n={};(a.data.content||a.data||[]).forEach(u=>n[u.id]=u),P(n);const b={};(s.data.content||s.data||[]).forEach(u=>b[u.id]=u),q(b);const h={};(l.data.content||l.data||[]).forEach(u=>h[u.id]=u),U(h)}catch(m){console.error("Failed to load lookup data",m)}})()},[]);const[k,E]=o.useState([]),[c,$]=o.useState("all"),[w,D]=o.useState(!1),[v,O]=o.useState(!1),[g,B]=o.useState({start:null,end:null});o.useEffect(()=>{(async()=>{const i={Authorization:`Bearer ${localStorage.getItem("token")}`};E([]),$("all");try{let a=[];if(d==="Manufacturing Order")a=((await p.get(`${f}/production/manufacturing-orders`,{headers:i,params:{size:1e3}})).data.content||[]).map(l=>({id:l.id,label:l.moNumber}));else if(d==="Workstation"){const s=await p.get(`${f}/production/work-groups`,{headers:i});a=(Array.isArray(s.data)?s.data:s.data.content||[]).map(n=>({id:n.id,label:n.name}))}else if(d==="Employees"){const s=await p.get(`${f}/employees/all`,{headers:i});a=(Array.isArray(s.data)?s.data:s.data.content||[]).map(n=>({id:n.id,label:`${n.firstName} ${n.lastName}`}))}E(a)}catch(a){console.error("Failed to fetch filter options",a)}})()},[d]),o.useEffect(()=>{g.start&&g.end&&C(g.start,g.end)},[c,j,x,y]);const C=async(e,m)=>{S(!0);try{const a={Authorization:`Bearer ${localStorage.getItem("token")}`},s=e.toISOString().split("T")[0],l=m.toISOString().split("T")[0];let n=[];if(d==="Manufacturing Order"||d==="Employees"){let b=`${f}/production/manufacturing-orders`;const h={size:1e3,fromDate:s,toDate:l};d==="Employees"&&c!=="all"&&(b=`${f}/production/manufacturing-orders/assigned-to/${c}`,delete h.fromDate,delete h.toDate);let N=(await p.get(b,{headers:a,params:h})).data.content||[];d==="Manufacturing Order"&&c!=="all"&&(N=N.filter(t=>t.id===parseInt(c)||t.id===c)),n=N.map(t=>{let J=t.scheduleStart||t.createdAt,K=t.scheduleFinish||t.dueDate||t.scheduleStart||t.createdAt;const A=t.itemName||t.finishedGoodName||t.finishedGood?.name||j[t.finishedGoodId]?.name||"Unknown Item",Q=t.customerName||x[t.customerId]?.companyName||x[t.customerId]?.primaryContactPerson||"",X=t.salesOrder?.soNumber||y[t.salesOrderId]?.soNumber||y[t.salesOrder?.id]?.soNumber||"";return{id:`mo-${t.id}`,title:t.moNumber,start:J,end:K,backgroundColor:M(t.status),borderColor:M(t.status),extendedProps:{type:"MO",moNumber:t.moNumber,itemName:A,customerName:Q,soNumber:X,quantity:t.quantity,status:t.status,details:`${A} (${t.quantity} ${t.unit||""})`}}})}T(n)}catch(i){console.error("Error fetching schedules",i)}finally{S(!1)}},M=e=>{switch(e){case"SCHEDULED":return"#fbbf24";case"IN_PROGRESS":return"#3b82f6";case"COMPLETED":return"#10b981";case"PAUSED":return"#f59e0b";case"CANCELLED":return"#ef4444";default:return"#fbbf24"}},V=e=>{B({start:e.start,end:e.end}),C(e.start,e.end)},H=e=>{G(e),O(!1)},z=e=>{$(e),D(!1)},W=e=>{const{start:m,end:i}=e.event,a=e.event.extendedProps,s=m?m.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",l=i?i.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",n=`${s} - ${l}`;return r.jsxs("div",{className:"p-1 text-xs leading-none overflow-hidden h-full flex flex-col gap-0.5 text-white shadow-sm hover:opacity-90 transition-opacity",children:[r.jsxs("div",{className:"font-semibold truncate",children:[n," #",a.moNumber]}),r.jsxs("div",{className:"truncate opacity-90 text-[10px]",children:[a.itemName,a.quantity&&` (${a.quantity})`]})]})},_=c==="all"?"All":k.find(e=>e.id===c)?.label||"All";return r.jsxs("div",{className:"h-full flex flex-col bg-slate-50 dark:bg-slate-900",children:[r.jsxs("div",{className:"bg-primary px-6 py-4 shadow-md z-20 flex flex-col sm:flex-row items-center justify-between gap-4",children:[r.jsx("div",{className:"flex items-center gap-4 w-full sm:w-auto",children:r.jsxs("div",{children:[r.jsx("h1",{className:"text-2xl font-bold text-white tracking-tight",children:"Production Schedule"}),r.jsx("p",{className:"text-sm text-blue-100 opacity-90",children:"Manage timelines and resources"})]})}),r.jsxs("div",{className:"flex items-center gap-3 w-full sm:w-auto",children:[r.jsxs("div",{className:"relative",children:[r.jsxs("button",{onClick:()=>O(!v),className:"bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors justify-between min-w-[180px] backdrop-blur-sm",children:[d,r.jsx(F,{size:16,className:`transform transition-transform ${v?"rotate-90":"rotate-0"}`})]}),v&&r.jsx("div",{className:"absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl z-50 rounded-lg overflow-hidden py-1",children:["Manufacturing Order","Employees"].map(e=>r.jsx("div",{onClick:()=>H(e),className:`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${d===e?"bg-blue-50 text-priority font-medium":"text-gray-700"}`,children:e},e))})]}),r.jsxs("div",{className:"relative",children:[r.jsxs("button",{onClick:()=>D(!w),className:"bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors justify-between min-w-[200px]",children:[r.jsx("span",{className:"truncate max-w-[180px]",children:_}),r.jsx(F,{size:16,className:`transform transition-transform text-primary ${w?"rotate-90":"rotate-0"}`})]}),w&&r.jsxs("div",{className:"absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl z-50 rounded-lg overflow-y-auto max-h-96 py-1",children:[r.jsx("div",{onClick:()=>z("all"),className:`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${c==="all"?"bg-blue-50 text-priority font-medium":"text-gray-700"}`,children:"All"}),k.map(e=>r.jsx("div",{onClick:()=>z(e.id),className:`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors ${c===e.id?"bg-blue-50 text-priority font-medium":"text-gray-700"}`,children:e.label},e.id))]})]})]})]}),r.jsxs("div",{className:"flex-1 p-4 md:p-6 overflow-hidden relative",children:[L&&r.jsx("div",{className:"absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 flex items-center justify-center backdrop-blur-[1px]",children:r.jsx(re,{className:"h-10 w-10 text-primary animate-spin"})}),r.jsx("style",{children:`
                    .fc-toolbar-title { 
                        font-size: 1.25rem !important; 
                        font-family: inherit; 
                        font-weight: 700; 
                        color: #1f2937;
                    }
                    .fc-col-header-cell-cushion {
                        color: #4b5563;
                        font-weight: 600;
                        padding-top: 12px;
                        padding-bottom: 12px;
                        text-transform: uppercase;
                        font-size: 0.75rem;
                        letter-spacing: 0.05em;
                    }
                    .fc .fc-button-primary { 
                        background-color: #ffffff; 
                        border-color: #e5e7eb; 
                        color: #374151; 
                        font-weight: 500;
                        text-transform: capitalize;
                        padding: 0.5rem 1rem;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    }
                    .fc .fc-button-primary:hover { 
                        background-color: #f9fafb; 
                        border-color: #d1d5db;
                        color: #111827; 
                    }
                    .fc .fc-button-primary:not(:disabled).fc-button-active, 
                    .fc .fc-button-primary:not(:disabled):active { 
                        background-color: #eff6ff; 
                        border-color: #bfdbfe;
                        color: #1d4ed8;
                        box-shadow: none;
                    }
                    .fc-theme-standard td, .fc-theme-standard th {
                        border-color: #e5e7eb;
                    }
                    .fc-day-today {
                        background-color: #f9fafb !important;
                    }
                    .fc-event { 
                        border: none !important; 
                        margin-bottom: 2px !important; 
                        border-radius: 4px;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    }
                    .fc-h-event { background-color: transparent; }
                `}),r.jsx("div",{className:"bg-white rounded-xl shadow-sm border border-gray-200 h-full p-4",children:r.jsx(Y,{ref:R,plugins:[Z,ee,te],initialView:"dayGridMonth",headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,timeGridDay"},events:I,datesSet:V,eventContent:W,height:"100%",dayMaxEvents:4,eventDisplay:"block",forceEventDuration:!0,defaultTimedEventDuration:"01:00:00"})})]})]})};export{le as default};
