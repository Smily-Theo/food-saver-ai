
/* FoodSaver AI — Supabase connection
   Project URL configured for this project:
   https://bpsgevzareqwzflwdawj.supabase.co

   For production, set these before loading the app:
   window.FOODSAVER_SUPABASE_URL
   window.FOODSAVER_SUPABASE_KEY

   Never put a Supabase service_role/secret key in this file.
*/
const SUPABASE_URL = window.FOODSAVER_SUPABASE_URL || "https://bpsgevzareqwzflwdawj.supabase.co";
const SUPABASE_KEY = window.FOODSAVER_SUPABASE_KEY || "";
const hasSupabase = !!(window.supabase && SUPABASE_URL && SUPABASE_KEY);
const sb = hasSupabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

async function loadCloudInventory() {
  if (!sb) return false;
  const { data, error } = await sb.from("food_items")
    .select("id,name,category,quantity,expiry_date,status")
    .order("expiry_date", { ascending: true });
  if (error) { console.warn("Supabase inventory read:", error.message); return false; }
  inventory = (data || []).map(x => ({
    id:x.id, name:x.name, category:x.category, quantity:x.quantity,
    expiry:x.expiry_date, emoji:{Fruit:"🍎",Vegetable:"🥕",Dairy:"🥛",Grain:"🍚",Protein:"🥚",Other:"🥫"}[x.category] || "🥫"
  }));
  renderExpiry(); renderInventory();
  return true;
}

async function saveCloudFood(item) {
  if (!sb) return true;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    toast("Demo mode: sign in is required for cloud saving.");
    return false;
  }
  const { data, error } = await sb.from("food_items").insert({
    user_id:user.id, name:item.name, category:item.category,
    quantity:item.quantity, expiry_date:item.expiry, status:"active"
  }).select().single();
  if (error) { toast("Database error: " + error.message); return false; }
  item.id = data.id;
  return true;
}

async function ensureProfile() {
  if (!sb) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("profiles").upsert({id:user.id, display_name:user.user_metadata?.display_name || "Theo"});
}

async function connectSupabase() {
  if (!sb) return;
  sb.auth.onAuthStateChange(() => { ensureProfile(); loadCloudInventory(); });
  await ensureProfile();
  await loadCloudInventory();
}

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let inventory=[
 {id:1,name:"Milk",emoji:"🥛",category:"Dairy",quantity:"2 L",expiry:"2026-09-29"},
 {id:2,name:"Tomatoes",emoji:"🍅",category:"Vegetable",quantity:"1 kg",expiry:"2026-09-30"},
 {id:3,name:"Bread",emoji:"🍞",category:"Grain",quantity:"1 pack",expiry:"2026-10-01"},
 {id:4,name:"Bananas",emoji:"🍌",category:"Fruit",quantity:"6 pcs",expiry:"2026-10-05"},
 {id:5,name:"Eggs",emoji:"🥚",category:"Protein",quantity:"12 pcs",expiry:"2026-10-08"},
 {id:6,name:"Rice",emoji:"🍚",category:"Grain",quantity:"5 kg",expiry:"2026-10-18"}
];
const recipes=[
 {emoji:"🍳",name:"Tomato Egg Toast",desc:"Use tomatoes, eggs and bread before they lose freshness."},
 {emoji:"🥣",name:"Creamy Tomato Soup",desc:"A simple rescue meal built around your tomatoes and milk."},
 {emoji:"🍌",name:"Banana Breakfast Bowl",desc:"Turn ripe bananas into a quick zero-waste breakfast."}
];
function daysLeft(date){return Math.ceil((new Date(date+"T23:59:59")-new Date())/86400000)}
function status(item){let d=daysLeft(item.expiry);return d<=1?["urgent","Use today"]:d<=3?["soon",`${d} days left`]:["fresh",`${d} days left`]}
function renderExpiry(){ $("#expiryList").innerHTML=inventory.slice().sort((a,b)=>daysLeft(a.expiry)-daysLeft(b.expiry)).slice(0,4).map(x=>{let s=status(x);return `<div class="expiry-item"><div class="food-icon">${x.emoji}</div><div><b>${x.name}</b><small>${x.quantity} · expires ${new Date(x.expiry).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</small></div><span class="status ${s[0]}">${s[1]}</span></div>`}).join("")}
function renderInventory(filter="all",query=""){let arr=inventory.filter(x=>x.name.toLowerCase().includes(query.toLowerCase()));if(filter==="urgent")arr=arr.filter(x=>daysLeft(x.expiry)<=3);if(filter==="fresh")arr=arr.filter(x=>daysLeft(x.expiry)>3);$("#inventoryGrid").innerHTML=arr.map(x=>{let s=status(x),pct=Math.max(10,Math.min(100,daysLeft(x.expiry)*7));return `<article class="inventory-card"><div class="big-food">${x.emoji}</div><div class="row"><div><h3>${x.name}</h3><p>${x.category} · ${x.quantity}</p></div><span class="status ${s[0]}">${s[1]}</span></div><div class="progress"><i style="width:${pct}%"></i></div><p>Best use window: ${new Date(x.expiry).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p></article>`}).join("")||"<div class='panel'>No food items found.</div>"}
function renderRecipes(){$("#recipeCards").innerHTML=recipes.map(r=>`<article class="recipe"><div class="recipe-top">${r.emoji}</div><div class="recipe-body"><b>${r.name}</b><p>${r.desc}</p></div></article>`).join("")}
function navigate(page){$$(".content").forEach(x=>x.classList.add("hidden"));$("#page-"+page).classList.remove("hidden");$$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===page));if(page==="inventory")renderInventory();$("#sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
$("#addFoodTop").onclick=$("#addFoodBtn").onclick=()=>$("#foodModal").classList.remove("hidden");
$("#closeModal").onclick=()=>$("#foodModal").classList.add("hidden");
$("#foodModal").onclick=e=>{if(e.target.id==="foodModal")$("#foodModal").classList.add("hidden")};
$("#foodForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),emoji={Fruit:"🍎",Vegetable:"🥕",Dairy:"🥛",Grain:"🍚",Protein:"🥚",Other:"🥫"}[f.get("category")]||"🥫";const item={id:Date.now(),name:f.get("name"),emoji,category:f.get("category"),quantity:f.get("quantity"),expiry:f.get("expiry")};
if(hasSupabase){ const ok=await saveCloudFood(item); if(!ok)return; }
inventory.unshift(item);e.target.reset();$("#foodModal").classList.add("hidden");renderExpiry();renderInventory();toast(hasSupabase ? "Food saved to Supabase 🌱" : "Food added — we'll help you save it 🌱")};
$$(".filter").forEach(b=>b.onclick=()=>{$$(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderInventory(b.dataset.filter,$("#inventorySearch").value)});
$("#inventorySearch").oninput=e=>renderInventory($(".filter.active").dataset.filter,e.target.value);
$("#globalSearch").oninput=e=>{if(e.target.value.trim()){navigate("inventory");$("#inventorySearch").value=e.target.value;renderInventory("all",e.target.value)}};
function toast(t){$("#toast").textContent=t;$("#toast").classList.remove("hidden");setTimeout(()=>$("#toast").classList.add("hidden"),2600)}
function aiReply(text){let t=text.toLowerCase();if(t.includes("recipe")||t.includes("cook"))return "Based on your inventory, try <b>Tomato Egg Toast</b>. Use your tomatoes, eggs and bread first. It can rescue ingredients that are close to expiry. 🍳";if(t.includes("store")||t.includes("vegetable"))return "For most vegetables, keep them dry and cool, and separate ethylene-sensitive produce. I’d prioritize your tomatoes within the next two days. 🥕";return "Your highest-priority items are <b>milk</b> and <b>tomatoes</b>. I recommend using them first, then planning a meal around bread and eggs. This could rescue about 0.8 kg of food. 🌱"}
function sendChat(text){if(!text.trim())return;let box=$("#chatMessages");box.insertAdjacentHTML("beforeend",`<div class="bubble user">${text}</div>`);setTimeout(()=>{box.insertAdjacentHTML("beforeend",`<div class="bubble ai">${aiReply(text)}</div>`);box.scrollTop=box.scrollHeight},350)}
$("#chatForm").onsubmit=e=>{e.preventDefault();sendChat($("#chatInput").value);$("#chatInput").value=""};
$$(".quick-prompts button").forEach(b=>b.onclick=()=>sendChat(b.textContent));
$("#rescueBtn").onclick=()=>{sendChat("Create a rescue plan");toast("Rescue plan generated by FoodSaver AI")};
$("#notifBtn").onclick=()=>toast("You have 3 expiry alerts: milk, tomatoes and bread.");
$("#exportBtn").onclick=()=>{const text="FoodSaver AI Impact Report\nFood saved: 18.4 kg\nMoney saved: ₹1,850\nCO2 avoided: 31.2 kg\nWaste reduction: 32%";const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/plain"}));a.download="foodsaver-impact-report.txt";a.click();toast("Impact report exported")};
function drawChart(){const c=$("#wasteChart"),ctx=c.getContext("2d"),d=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;c.width=w*d;c.height=h*d;ctx.scale(d,d);ctx.clearRect(0,0,w,h);let vals=[65,54,61,43,48,32,27],max=70;ctx.beginPath();vals.forEach((v,i)=>{let x=i*(w/(vals.length-1)),y=h-v/max*(h-20)-5;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle="#3f9861";ctx.lineWidth=3;ctx.stroke();vals.forEach((v,i)=>{let x=i*(w/(vals.length-1)),y=h-v/max*(h-20)-5;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle="#3f9861";ctx.fill()})}
renderExpiry();renderInventory();renderRecipes();drawChart();window.addEventListener("resize",drawChart);

connectSupabase();
