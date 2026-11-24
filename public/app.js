const promptEl = document.getElementById('prompt');
const generateBtn = document.getElementById('generate');
const empty = document.getElementById('empty');
const result = document.getElementById('result');
const resultText = document.getElementById('resulttext');
const errorBox = document.getElementById('error');
let lastPayload = null;
function hideError(){ errorBox.classList.add('hidden'); errorBox.textContent=''; }
function setLoading(on){ generateBtn.disabled=on; generateBtn.innerHTML=on?'<span class="spinner"></span> Generating…':'<span>✦</span> Generate text <span class="arrow">→</span>'; }
async function generate(){
 const prompt=promptEl.value.trim(); if(!prompt){promptEl.focus();promptEl.classList.add('invalid');setTimeout(()=>promptEl.classList.remove('invalid'),900);return;}
 lastPayload={prompt,type:document.getElementById('type').value,tone:document.getElementById('tone').value,length:document.getElementById('length').value};
 hideError();setLoading(true);
 try{const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lastPayload)});const data=await response.json();if(!response.ok)throw new Error(data.error||'Request failed');resultText.textContent=data.text;empty.classList.add('hidden');result.classList.remove('hidden');}
 catch(e){errorBox.textContent=e.message;errorBox.classList.remove('hidden');}
 finally{setLoading(false);}
}
generateBtn.addEventListener('click',generate);
 document.getElementById('regenerate').addEventListener('click',generate);
document.getElementById('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(resultText.textContent);const b=document.getElementById('copy');b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy text',1300);}catch{errorBox.textContent='Clipboard copy failed. Select and copy the text manually.';errorBox.classList.remove('hidden');}});
document.querySelectorAll('.suggest').forEach(btn=>btn.addEventListener('click',()=>{promptEl.value=btn.dataset.prompt;promptEl.focus();}));
promptEl.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')generate();});
