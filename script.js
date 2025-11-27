const observer=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in-view")}})},{threshold:.15});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

function animateCount(el){const target=parseInt(el.getAttribute("data-count"),10);const duration=1400;const start=performance.now();function step(now){const p=Math.min((now-start)/duration,1);const eased=1-Math.pow(1-p,3);const value=Math.floor(eased*target);el.textContent=target>=1000?value.toLocaleString():value;if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)}
document.querySelectorAll(".stat__value").forEach(el=>{const io=new IntersectionObserver((entries)=>{entries.forEach(x=>{if(x.isIntersecting){animateCount(el);io.disconnect()}})},{threshold:.5});io.observe(el)});

document.querySelectorAll('a[href^="#"]').forEach(link=>{link.addEventListener("click",e=>{const id=link.getAttribute("href").substring(1);const target=document.getElementById(id);if(target){e.preventDefault();target.scrollIntoView({behavior:"smooth"})}})});

const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion){
  const header=document.querySelector('.header');
  const heroImg=document.querySelector('.hero__image');
  let lastY=0;
  window.addEventListener('scroll',()=>{
    const y=window.scrollY||document.documentElement.scrollTop;
    if(header){header.classList.toggle('scrolled', y>8)}
    if(header){
      const doc=document.documentElement;
      const h=doc.scrollHeight-doc.clientHeight;
      const p=h>0?Math.min(1,y/h):0;
      header.style.setProperty('--progress', p);
    }
    if(heroImg){
      const delta=Math.min(20, Math.max(-20, (y-lastY)*0.06));
      heroImg.style.transform=`translateY(${delta}px)`;
    }
    lastY=y;
  },{passive:true});
}

document.querySelectorAll('img[data-fallback]').forEach(img=>{
  const fallback=img.getAttribute('data-fallback');
  img.addEventListener('error',()=>{if(fallback && img.src!==fallback){img.src=fallback}else{img.style.display='none'}});
});

document.querySelectorAll('.brand__logo').forEach(img=>{
  img.addEventListener('error',()=>{img.style.display='none'});
});

Array.from(document.images).forEach(img=>{
  if(img.complete){img.classList.add('loaded')}else{img.addEventListener('load',()=>img.classList.add('loaded'))}
});
Array.from(document.images).forEach(img=>{
  img.addEventListener('error',()=>{img.style.display='none'});
});

const menuToggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
const body=document.body;
if(menuToggle&&nav){
  menuToggle.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    body.classList.toggle('menu-open',open);
    menuToggle.setAttribute('aria-expanded',open?"true":"false");
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    if(nav.classList.contains('open')){
      nav.classList.remove('open');
      body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded','false');
    }
  }));
}

const track=document.querySelector('.carousel__track');
const items=track?Array.from(track.querySelectorAll('.carousel__item')):[];
let index=0;
let timer;
function show(i){
  items.forEach((it,idx)=>{it.classList.toggle('active',idx===i)});
}
function next(){
  index=(index+1)%items.length;show(index);
}
function prev(){
  index=(index-1+items.length)%items.length;show(index);
}
function autoplay(){
  if(timer)clearInterval(timer);
  timer=setInterval(next,3000);
}
if(items.length){
  show(0);autoplay();
  const nextBtn=document.querySelector('.carousel__btn.next');
  const prevBtn=document.querySelector('.carousel__btn.prev');
  if(nextBtn)nextBtn.addEventListener('click',()=>{next();autoplay()});
  if(prevBtn)prevBtn.addEventListener('click',()=>{prev();autoplay()});
}

const form=document.getElementById('contact-form');
if(form){
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const name=form.querySelector('#name');
    const email=form.querySelector('#email');
    const message=form.querySelector('#message');
    const valid=name.value.trim()&&email.value.trim()&&message.value.trim();
    if(valid){
      const mailto=`mailto:hamid.bounou@boussafa.ma?subject=Contact from ${encodeURIComponent(name.value.trim())}&body=${encodeURIComponent(message.value.trim()+"\n\nEmail: "+email.value.trim())}`;
      window.location.href=mailto;
    }else{
      [name,email,message].forEach(f=>{if(!f.value.trim()){f.style.borderColor='#e07a7a'}else{f.style.borderColor=''}});
    }
  });
}

const reduceMotionPref=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotionPref&&window.gsap){
  const gsap=window.gsap;
  if(window.ScrollTrigger){
    gsap.registerPlugin(window.ScrollTrigger);
  }
  gsap.from('.hero .hero__text > *',{opacity:0,y:24,stagger:.12,duration:.8,ease:'power2.out'});
  document.querySelectorAll('.section').forEach(sec=>{
    const elems=sec.querySelectorAll('.reveal');
    elems.forEach(el=>{
      gsap.from(el,{opacity:0,y:28,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 85%'}});
    });
  });
  const heroImage=document.querySelector('.hero__image');
  if(heroImage){
    gsap.to(heroImage,{y:-12,duration:10,yoyo:true,repeat:-1,ease:'sine.inOut'});
  }
}

const partnersSlider=document.querySelector('.logo-slider');
const partnersTrack=partnersSlider?partnersSlider.querySelector('.logo-track'):null;
if(partnersSlider&&partnersTrack){
  const reduceMotionPref=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId=null;let x=0;let paused=false;let last=performance.now();const speed=50;

  function stop(){if(rafId){cancelAnimationFrame(rafId);rafId=null}}

  function populate(){
    const baseItems=Array.from(partnersSlider.querySelectorAll('.logo-item'));
    if(baseItems.length===0){stop();partnersSlider.style.display='none';return false}
    partnersSlider.style.display='';
    partnersTrack.innerHTML='';
    baseItems.forEach(n=>partnersTrack.appendChild(n.cloneNode(true)));
    const maxRounds=16;let rounds=0;
    const sliderW=Math.max(1, partnersSlider.offsetWidth);
    while(partnersTrack.scrollWidth < sliderW*2 && rounds<maxRounds){
      baseItems.forEach(n=>partnersTrack.appendChild(n.cloneNode(true)));
      rounds++;
    }
    partnersTrack.querySelectorAll('img').forEach(img=>{
      if(!img.dataset.bound){
        img.dataset.bound='1';
        img.addEventListener('error',()=>{
          const item=img.closest('.logo-item');
          if(item){item.remove();}
          stop();start();
        });
      }
    });
    return partnersTrack.scrollWidth>0;
  }

  function start(){
    if(reduceMotionPref) return;
    if(!populate()) return;
    x=0;last=performance.now();
    function tick(now){
      const dt=(now-last)/1000;last=now;
      if(!paused){
        const limit=Math.max(1, partnersTrack.scrollWidth/2);
        x-=speed*dt;
        if(Math.abs(x)>limit){x+=limit}
        partnersTrack.style.transform=`translateX(${x}px)`;
      }
      rafId=requestAnimationFrame(tick);
    }
    stop();rafId=requestAnimationFrame(tick);
  }

  // initial error handlers will be attached inside populate()

  const io=new IntersectionObserver((entries)=>{entries.forEach(e=>{paused=!e.isIntersecting})});
  io.observe(partnersSlider);
  partnersSlider.addEventListener('mouseenter',()=>paused=true);
  partnersSlider.addEventListener('mouseleave',()=>paused=false);
  partnersSlider.addEventListener('touchstart',()=>paused=true,{passive:true});
  partnersSlider.addEventListener('touchend',()=>paused=false);
  window.addEventListener('resize',()=>{x=0;start()},{passive:true});
  start();
}
