// ===== FIREBASE SETUP =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyATn1yWqgYFj0c_9ShfEN_QFIM0a79LG6E",
    authDomain: "estudio-da-praca.firebaseapp.com",
    projectId: "estudio-da-praca",
    storageBucket: "estudio-da-praca.firebasestorage.app",
    messagingSenderId: "169699076157",
    appId: "1:169699076157:web:0f56f081cbaad77d182254"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== SCROLL REVEAL =====
// Anima qualquer elemento com class="reveal" ao entrar na tela,

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visivel');
            revealObserver.unobserve(entry.target); // anima só uma vez
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

function ativarReveal(elementos) {
    const grupos = new Map();
    elementos.forEach(el => {
        const pai = el.parentElement;
        if (!grupos.has(pai)) grupos.set(pai, []);
        grupos.get(pai).push(el);
    });
    grupos.forEach(itens => {
        itens.forEach((el, i) => {
            el.style.transitionDelay = `${Math.min(i * 0.08, 0.4)}s`;
            revealObserver.observe(el);
        });
    });
}

// Itens já presentes no HTML no carregamento da página
ativarReveal(document.querySelectorAll('.reveal'));



// ===== TOGGLE MENU =====
const menuBtn = document.getElementById('menu-btn');
const dropdown = document.getElementById('dropdown');

if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('aberto');
    });
}
document.addEventListener('click', () => {
    if (dropdown) dropdown.classList.remove('aberto');
    dropdown?.addEventListener('click', (e) => e.stopPropagation());
});


// ===== MOBILE NAVBAR =====
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileUserBtn = document.getElementById('mobile-user-btn');
const mobileDrawer = document.getElementById('mobile-drawer');
const mobileUserDrawer = document.getElementById('mobile-user-drawer');
const mobileOverlay = document.getElementById('mobile-drawer-overlay');
const drawerLinks = document.querySelectorAll('.drawer-link');
const trilhoMobile = document.getElementById('trilho-mobile');


// ----- Abrir/fechar gavetas -----
function fecharTodasGavetas() {
    mobileDrawer?.classList.remove('aberto');
    mobileUserDrawer?.classList.remove('aberto');
    mobileOverlay?.classList.remove('aberto');
    document.body.style.overflow = '';
}

function abrirGaveta(gaveta) {
    fecharTodasGavetas();
    gaveta.classList.add('aberto');
    mobileOverlay.classList.add('aberto');
    document.body.style.overflow = 'hidden';
}

mobileMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileDrawer.classList.contains('aberto')
        ? fecharTodasGavetas()
        : abrirGaveta(mobileDrawer);
});

mobileUserBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileUserDrawer.classList.contains('aberto')
        ? fecharTodasGavetas()
        : abrirGaveta(mobileUserDrawer);
});

// Overlay fecha qualquer gaveta
mobileOverlay?.addEventListener('click', fecharTodasGavetas);

// Links fecham a gaveta e navegam
drawerLinks.forEach(link => {
    link.addEventListener('click', fecharTodasGavetas);
});

// ----- Botões de login/cadastro na gaveta user -----
document.getElementById('drawer-ir-login')?.addEventListener('click', () => {
    fecharTodasGavetas();
    location.href = 'login.html';
});


document.getElementById('drawer-sair')?.addEventListener('click', async () => {
    fecharTodasGavetas();
    await signOut(auth);
});

document.getElementById('drawer-ir-cadastro')?.addEventListener('click', () => {
    fecharTodasGavetas();
    location.href = 'login.html#cadastro';
});

// ===== MODO ESCURO / CLARO =====

function aplicarTema(dark) {
    document.body.classList.toggle('dark', dark);
    document.getElementById('trilho')?.classList.toggle('dark', dark);
    document.getElementById('trilho-mobile')?.classList.toggle('dark', dark);
    localStorage.setItem('tema', dark ? 'dark' : 'light');
}

document.getElementById('trilho')?.addEventListener('click', () => {
    aplicarTema(!document.body.classList.contains('dark'));
});

document.getElementById('trilho-mobile')?.addEventListener('click', () => {
    aplicarTema(!document.body.classList.contains('dark'));
});

// Aplica tema salvo ao carregar
aplicarTema(localStorage.getItem('tema') === 'dark');

// Aplica tema salvo ao carregar
aplicarTema(localStorage.getItem('tema') === 'dark');

// ----- Navbar: transparente no topo, com fundo ao rolar -----
// (só aplica em mobile — a classe .scrolled é adicionada pelo scroll)
const navbarEl = document.querySelector('.navbar');
function atualizarNavbarScroll() {
    if (window.innerWidth <= 768) {
        navbarEl?.classList.toggle('scrolled', window.scrollY > 10);
    } else {
        navbarEl?.classList.remove('scrolled');
    }
}
window.addEventListener('scroll', atualizarNavbarScroll, { passive: true });
window.addEventListener('resize', atualizarNavbarScroll);
atualizarNavbarScroll(); // roda na carga

document.addEventListener('DOMContentLoaded', () => {

    // ===== CARROSSEL COM SWIPE SUAVE =====
    let carrosselIndex = 0;
    const slidesEl = document.querySelector('.slides');
    const totalSlides = document.querySelectorAll('.slides img').length;
    let carrosselAuto;
    let touchStartX = 0;
    let touchDeltaX = 0;
    let isDraggingCarrossel = false;

    const dotsContainer = document.getElementById('carousel-dots');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('ativo');
        dot.addEventListener('click', () => irParaSlide(i));
        dotsContainer.appendChild(dot);
    }

    function atualizarDots() {
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('ativo', i === carrosselIndex);
        });
    }

    function irParaSlide(n, animado = true) {
        carrosselIndex = (n + totalSlides) % totalSlides;
        slidesEl.style.transition = animado
            ? 'transform 0.45s cubic-bezier(0.4,0,0.2,1)'
            : 'none';
        slidesEl.style.transform = `translateX(-${carrosselIndex * 100}%)`;
        atualizarDots();
        reiniciarAuto();
    }

    function reiniciarAuto() {
        clearInterval(carrosselAuto);
        carrosselAuto = setInterval(() => irParaSlide(carrosselIndex + 1), 7000);
    }

    document.querySelector('.next')?.addEventListener('click', () => irParaSlide(carrosselIndex + 1));
    document.querySelector('.prev')?.addEventListener('click', () => irParaSlide(carrosselIndex - 1));

    const carrosselEl = document.querySelector('.carousel');
    if (carrosselEl) {
        carrosselEl.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            isDraggingCarrossel = true;
            slidesEl.style.transition = 'none';
        }, { passive: true });

        carrosselEl.addEventListener('touchmove', (e) => {
            if (!isDraggingCarrossel) return;
            touchDeltaX = e.touches[0].clientX - touchStartX;
            const base = -carrosselIndex * 100;
            slidesEl.style.transform = `translateX(calc(${base}% + ${touchDeltaX}px))`;
        }, { passive: true });

        carrosselEl.addEventListener('touchend', () => {
            isDraggingCarrossel = false;
            if (touchDeltaX < -50) irParaSlide(carrosselIndex + 1);
            else if (touchDeltaX > 50) irParaSlide(carrosselIndex - 1);
            else irParaSlide(carrosselIndex);
            touchDeltaX = 0;
        });
    }

    reiniciarAuto();

}); // fim DOMContentLoaded


// ===== NAVBAR =====
const navbar = document.querySelector(".navbar");

let ultimoEstado = false;

function atualizarNavbar() {

    const scrollado = window.scrollY > 35;

    // Evita ficar adicionando/removendo classes a cada pixel
    if (scrollado === ultimoEstado) return;

    ultimoEstado = scrollado;

    navbar.classList.toggle("scrolled", scrollado);
    navbar.classList.toggle("shrink", scrollado);
}

let ticking = false;

window.addEventListener("scroll", () => {

    if (!ticking) {

        requestAnimationFrame(() => {

            atualizarNavbar();
            ticking = false;

        });

        ticking = true;
    }

});

// Estado inicial
atualizarNavbar();

window.addEventListener("scroll", atualizarNavbar);
navbar.classList.toggle('shrink', window.scrollY > 50);
atualizarNavbar();

// ===== LIGHTBOX =====
const galerias = document.querySelectorAll('.galeria');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const fechar = document.querySelector('.fechar');
const nextBtn = document.querySelector('.next-img');
const prevBtn = document.querySelector('.prev-img');

let indexAtual = 0;
let listaImagens = [];
let scrollCooldown = false;

// Guarda a galeria dona das imagens abertas (limitador)
let galeriaAtual = null;

galerias.forEach(galeria => {
    const imgs = galeria.querySelectorAll('img');
    imgs.forEach((img, i) => {
        img.addEventListener('click', () => {
            galeriaAtual = galeria;
            listaImagens = Array.from(imgs).map(im => im.src);
            indexAtual = i;
            abrirImagem();
        });
    });
});

// ===== ZOOM + PAN (pc: scroll | mobile: pinça + arrastar) =====
const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

let scaleAtual = 1;
let pinchDist = null;
let panX = 0;
let panY = 0;
let panStartX = 0;
let panStartY = 0;
let isPanning = false;
let lastTapTime = 0;

function aplicarTransform() {
    lightboxImg.style.transform = `scale(${scaleAtual}) translate(${panX / scaleAtual}px, ${panY / scaleAtual}px)`;
}

function resetarZoom(animado = true) {
    scaleAtual = 1;
    panX = 0;
    panY = 0;
    if (animado) {
        lightboxImg.style.transition = 'transform 0.3s ease';
        aplicarTransform();
        setTimeout(() => { lightboxImg.style.transition = ''; }, 300);
    } else {
        lightboxImg.style.transition = '';
        aplicarTransform();
    }
}

function destruirPanzoom() {
    resetarZoom(false);
    pinchDist = null;
    isPanning = false;
}

function getDistancia(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

if (lightboxImg) {

// ===== SWIPE ENTRE IMAGENS NO CELULAR =====

    // Swipe mobile no lightbox
    let lbTouchStartX = 0, lbTouchDeltaX = 0;

    lightbox?.addEventListener('touchstart', (e) => {
        if (scaleAtual > 1) return; // não swipa se estiver com zoom
        lbTouchStartX = e.touches[0].clientX;
        lbTouchDeltaX = 0;
    }, { passive: true });

    lightbox?.addEventListener('touchmove', (e) => {
        if (scaleAtual > 1) return;
        lbTouchDeltaX = e.touches[0].clientX - lbTouchStartX;
        if (Math.abs(lbTouchDeltaX) > 10) {
            lightboxImg.style.transition = 'none';
            lightboxImg.style.transform = `translateX(${lbTouchDeltaX}px) scale(1)`;
        }
    }, { passive: true });

    lightbox?.addEventListener('touchend', () => {
        if (scaleAtual > 1) return;
        lightboxImg.style.transition = 'transform 0.3s ease';
        if (lbTouchDeltaX < -60) proximaImagem();
        else if (lbTouchDeltaX > 60) imagemAnterior();
        else lightboxImg.style.transform = 'scale(1)';
        lbTouchDeltaX = 0;
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox?.style.display === 'flex') {
            if (e.key === 'Escape') fecharImagem();
            if (e.key === 'ArrowRight') proximaImagem();
            if (e.key === 'ArrowLeft') imagemAnterior();
        }
    });


    // ----- SCROLL (pc) -----
    lightboxImg.addEventListener('wheel', (e) => {
        if (isTouchDevice()) return;
        e.preventDefault();
        const fator = e.deltaY < 0 ? 1.12 : 0.88;
        const novoScale = Math.min(Math.max(scaleAtual * fator, 1), 5);

        if (novoScale === 1) { resetarZoom(true); return; }

        const rect = lightboxImg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        panX += mouseX * (1 - novoScale / scaleAtual);
        panY += mouseY * (1 - novoScale / scaleAtual);
        scaleAtual = novoScale;
        lightboxImg.style.transition = '';
        aplicarTransform();
    });

    // ----- DUPLO CLIQUE (pc) -----
    lightboxImg.addEventListener('dblclick', () => {
        if (isTouchDevice()) return;
        resetarZoom(true);
    });

    // ----- ARRASTAR (pc) -----
    lightboxImg.addEventListener('mousedown', (e) => {
        if (isTouchDevice() || scaleAtual <= 1) return;
        e.preventDefault();
        isPanning = true;
        panStartX = e.clientX - panX;
        panStartY = e.clientY - panY;
        lightboxImg.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - panStartX;
        panY = e.clientY - panStartY;
        lightboxImg.style.transition = '';
        aplicarTransform();
    });

    document.addEventListener('mouseup', () => {
        if (!isPanning) return;
        isPanning = false;
        lightboxImg.style.cursor = scaleAtual > 1 ? 'grab' : 'zoom-in';
    });

    // ----- PINÇA + DUPLO TOQUE + PAN (mobile) -----
    let pinchMidX = 0;
    let pinchMidY = 0;
    let panTouchStartX = 0;
    let panTouchStartY = 0;
    let panTouchAtivo = false;

    lightboxImg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            pinchDist = getDistancia(e.touches);
            pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            panTouchAtivo = false;
        } else if (e.touches.length === 1) {
            // Duplo toque
            const agora = Date.now();
            if (agora - lastTapTime < 300 && scaleAtual > 1) {
                e.preventDefault();
                resetarZoom(true);
                lastTapTime = 0;
                return;
            }
            lastTapTime = agora;

            // Pan com um dedo (só se tiver zoom)
            if (scaleAtual > 1) {
                e.preventDefault();
                panTouchAtivo = true;
                panTouchStartX = e.touches[0].clientX - panX;
                panTouchStartY = e.touches[0].clientY - panY;
            }
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && pinchDist !== null) {
            e.preventDefault();
            const novaDist = getDistancia(e.touches);
            const ratio = novaDist / pinchDist;
            const novoScale = Math.min(Math.max(scaleAtual * ratio, 1), 5);

            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const rect = lightboxImg.getBoundingClientRect();
            const centroX = midX - rect.left - rect.width / 2;
            const centroY = midY - rect.top - rect.height / 2;

            panX += centroX * (1 - ratio) + (midX - pinchMidX);
            panY += centroY * (1 - ratio) + (midY - pinchMidY);

            pinchMidX = midX;
            pinchMidY = midY;
            pinchDist = novaDist;
            scaleAtual = novoScale;

            lightboxImg.style.transition = '';
            aplicarTransform();

        } else if (e.touches.length === 1 && panTouchAtivo) {
            e.preventDefault();
            panX = e.touches[0].clientX - panTouchStartX;
            panY = e.touches[0].clientY - panTouchStartY;
            lightboxImg.style.transition = '';
            aplicarTransform();
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            pinchDist = null;
        }
        if (e.touches.length === 0) {
            panTouchAtivo = false;
            // Se o scale voltou para 1 ou menos, reseta tudo
            if (scaleAtual <= 1) resetarZoom(false);
        }
    });
}

// ===== ABRIR / FECHAR IMAGEM =====
function abrirImagem() {
    destruirPanzoom();

    lightboxImg.style.transition = 'none';
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.92)';
    lightboxImg.style.transformOrigin = 'center';
    lightboxImg.style.cursor = 'zoom-in';

    lightbox.style.display = 'flex';
    fechar.style.display = 'block';

    lightboxImg.onload = () => {
        requestAnimationFrame(() => {
            lightboxImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
            setTimeout(() => { lightboxImg.style.transition = ''; }, 260);
        });
    };

    lightboxImg.src = listaImagens[indexAtual];
}

function fecharImagem() {
    lightbox.style.display = 'none';
    fechar.style.display = 'none';
    destruirPanzoom();
}

function proximaImagem() {
    indexAtual = (indexAtual + 1) % listaImagens.length;
    abrirImagem();
}

function imagemAnterior() {
    indexAtual = (indexAtual - 1 + listaImagens.length) % listaImagens.length;
    abrirImagem();
}

if (fechar) fechar.addEventListener('click', fecharImagem);
if (nextBtn) nextBtn.addEventListener('click', proximaImagem);
if (prevBtn) prevBtn.addEventListener('click', imagemAnterior);

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) fecharImagem();
    });

    lightbox.addEventListener('wheel', (e) => {
        if (lightbox.style.display !== 'flex') return;
        const rect = lightboxImg.getBoundingClientRect();
        const dentroDaImagem =
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (dentroDaImagem) return;
        e.preventDefault();
        if (scrollCooldown) return;
        scrollCooldown = true;
        e.deltaY > 0 ? proximaImagem() : imagemAnterior();
        setTimeout(() => { scrollCooldown = false; }, 400);
    });
}

document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display === 'flex') {
        if (e.key === 'Escape') fecharImagem();
        if (e.key === 'ArrowRight') proximaImagem();
        if (e.key === 'ArrowLeft') imagemAnterior();
    }
});

// ===== AVALIAÇÕES (FIREBASE) =====
let usuarioAtual = null;
let estrelaSelecionada = 5;
let idxParaExcluir = null;
let modoAviso = false;

// ----- MODAL DE AVISO -----
function mostrarAviso(mensagem) {
    modoAviso = true;
    document.querySelector('#modal-excluir .modal-texto').textContent = mensagem;
    document.getElementById('modal-confirmar').style.display = 'none';
    document.getElementById('modal-cancelar').textContent = 'OK';
    document.getElementById('modal-excluir').classList.add('aberto');
}

function fecharModal() {
    document.getElementById('modal-excluir').classList.remove('aberto');
    if (modoAviso) {
        modoAviso = false;
        document.getElementById('modal-confirmar').style.display = '';
        document.getElementById('modal-cancelar').textContent = 'Cancelar';
        document.querySelector('#modal-excluir .modal-texto').textContent = 'Excluir esta avaliação?';
        idxParaExcluir = null;
    } else {
        idxParaExcluir = null;
    }
}

// ----- BOTÕES DO MODAL -----
document.getElementById('modal-confirmar').onclick = async () => {
    if (!idxParaExcluir) return;
    try {
        await deleteDoc(doc(db, 'avaliacoes', idxParaExcluir));
    } catch (e) {
        mostrarAviso('Erro ao excluir avaliação.');
    }
    fecharModal();
    carregarAvaliacoes();
};

document.getElementById('modal-cancelar').onclick = fecharModal;

document.getElementById('modal-excluir').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-excluir')) fecharModal();
});

// ----- AUTH STATE -----
onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioAtual = { uid: user.uid, nome: user.displayName || user.email };
    } else {
        usuarioAtual = null;
    }
    renderAuth();
    carregarAvaliacoes();
});

// ----- RENDER AUTH -----
function renderAuth() {
    const loginBox = document.getElementById('login-box');
    const logadoBox = document.getElementById('logado-box');
    const comentarArea = document.getElementById('comentar-area');

    // Itens do menu ☰ (PC)
    document.getElementById('menu-entrar').style.display = usuarioAtual ? 'none' : 'block';
    document.getElementById('menu-cadastro').style.display = usuarioAtual ? 'none' : 'block';
    document.getElementById('menu-sair').style.display = usuarioAtual ? 'block' : 'none';
    document.getElementById('menu-sair')?.addEventListener('click', async () => {
    dropdown?.classList.remove('aberto');
    await signOut(auth);
});

    if (usuarioAtual) {
        loginBox.style.display = 'none';
        logadoBox.style.display = 'block';
        comentarArea.style.display = 'block';
        document.getElementById('bem-vindo').textContent = `Olá, ${usuarioAtual.nome}! 👋`;
    } else {
        loginBox.style.display = 'flex';
        logadoBox.style.display = 'none';
        comentarArea.style.display = 'none';
    }
}


// ----- ESTRELAS DO FORMULÁRIO -----
document.querySelectorAll('#estrelas-input .estrela-sel').forEach(el => {
    el.addEventListener('click', () => {
        estrelaSelecionada = parseInt(el.dataset.val);
        document.querySelectorAll('#estrelas-input .estrela-sel').forEach((e, i) => {
            e.classList.toggle('ativa', i < estrelaSelecionada);
        });
    });
});

// ----- ENVIAR AVALIAÇÃO -----
document.getElementById('btn-enviar-comentario').onclick = async () => {
    const texto = document.getElementById('novo-comentario').value.trim();
    if (!texto || !usuarioAtual) return;

    const btn = document.getElementById('btn-enviar-comentario');
    btn.disabled = true;
    btn.textContent = 'Publicando...';

    try {
        const jaExiste = await getDocs(
            query(collection(db, 'avaliacoes'), where('uid', '==', usuarioAtual.uid))
        );
        if (!jaExiste.empty) {
            mostrarAviso('Você já possui uma avaliação. Edite a existente se quiser alterar.');
            btn.disabled = false;
            btn.textContent = 'Publicar avaliação';
            return;
        }

        await addDoc(collection(db, 'avaliacoes'), {
            uid: usuarioAtual.uid,
            nome: usuarioAtual.nome,
            texto,
            estrelas: estrelaSelecionada,
            data: new Date().toLocaleDateString('pt-BR'),
            createdAt: serverTimestamp()
        });
        document.getElementById('novo-comentario').value = '';
        estrelaSelecionada = 5;
        document.querySelectorAll('#estrelas-input .estrela-sel').forEach((e) => {
            e.classList.add('ativa');
        });
        carregarAvaliacoes();
    } catch (e) {
        mostrarAviso('Erro ao publicar avaliação. Tente novamente.');
    }

    btn.disabled = false;
    btn.textContent = 'Publicar avaliação';
};

// ----- CARREGAR AVALIAÇÕES DO FIRESTORE -----
async function carregarAvaliacoes() {
    const lista = document.getElementById('lista-avaliacoes');
    lista.innerHTML = '<p class="sem-avaliacoes">Carregando avaliações...</p>';

    try {
        const q = query(collection(db, 'avaliacoes'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            lista.innerHTML = '<p class="sem-avaliacoes">Nenhuma avaliação ainda. Seja o primeiro!</p>';
            return;
        }

        lista.innerHTML = '';

        // ----- NOTA MÉDIA -----
        let totalEstrelas = 0;
        const docs = [];
        snapshot.forEach(docSnap => {
            docs.push(docSnap);
            totalEstrelas += docSnap.data().estrelas || 0;
        });
        const media = (totalEstrelas / docs.length).toFixed(1);
        const mediaInteira = Math.round(totalEstrelas / docs.length);

        const resumo = document.getElementById('resumo-avaliacoes');
        if (resumo) {
            resumo.innerHTML = `
                <div class="nota-media reveal">
                    <span class="nota-numero">${media}</span>
                    <div class="nota-estrelas">${'★'.repeat(mediaInteira)}${'☆'.repeat(5 - mediaInteira)}</div>
                    <span class="nota-total">baseado em ${docs.length} avaliações</span>
                </div>
            `;
            ativarReveal(resumo.querySelectorAll('.reveal'));
        }

        docs.forEach(docSnap => {
            const av = docSnap.data();
            const docId = docSnap.id;
            const ehDono = usuarioAtual && usuarioAtual.uid === av.uid;

            const item = document.createElement('div');
            item.className = 'avaliacao-item reveal';
            item.id = `av-item-${docId}`;
            item.innerHTML = `
                <div class="av-header">
                    <span class="av-nome">${av.nome}</span>
                    <span class="av-estrelas">${'★'.repeat(av.estrelas)}${'☆'.repeat(5 - av.estrelas)}</span>
                    <span class="av-data">${av.data}</span>
                    ${ehDono ? `
                    <div class="av-opcoes-container">
                        <button class="av-opcoes-btn" data-id="${docId}">⋯</button>
                        <div class="av-menu" id="av-menu-${docId}">
                            <button data-editar="${docId}">✎ Editar</button>
                            <button data-excluir="${docId}">🗑 Excluir</button>
                        </div>
                    </div>` : ''}
                </div>
                <div id="av-texto-${docId}">
                    <p class="av-texto">${av.texto}</p>
                </div>
                <div id="av-edit-${docId}" style="display:none;">
                    <textarea class="comentario-input av-edit-input" id="av-edit-campo-${docId}">${av.texto}</textarea>
                    <div class="av-edit-estrelas" id="av-edit-estrelas-${docId}">
                        ${[1, 2, 3, 4, 5].map(n => `
                            <span class="estrela-sel ${n <= av.estrelas ? 'ativa' : ''}"
                                  data-idx="${docId}" data-val="${n}">★</span>
                        `).join('')}
                    </div>
                    <div class="auth-btns" style="margin-top:8px;">
                        <button class="btn-auth" data-salvar="${docId}">Salvar</button>
                        <button class="btn-auth btn-secondary" data-cancelar="${docId}">Cancelar</button>
                    </div>
                </div>
            `;
            lista.appendChild(item);
        });

        // Ativa o scroll reveal nos itens de avaliação recém-criados
        ativarReveal(lista.querySelectorAll('.avaliacao-item'));

        lista.querySelectorAll('.av-opcoes-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const menu = document.getElementById(`av-menu-${id}`);
                const aberto = menu.classList.contains('aberto');
                fecharTodosMenus();
                if (!aberto) menu.classList.add('aberto');
            });
        });

        lista.querySelectorAll('[data-editar]').forEach(btn => {
            btn.addEventListener('click', () => editarAvaliacao(btn.dataset.editar));
        });
        lista.querySelectorAll('[data-excluir]').forEach(btn => {
            btn.addEventListener('click', () => excluirAvaliacao(btn.dataset.excluir));
        });
        lista.querySelectorAll('[data-salvar]').forEach(btn => {
            btn.addEventListener('click', () => salvarEdicao(btn.dataset.salvar));
        });
        lista.querySelectorAll('[data-cancelar]').forEach(btn => {
            btn.addEventListener('click', () => cancelarEdicao(btn.dataset.cancelar));
        });
        lista.querySelectorAll('.av-edit-estrelas .estrela-sel').forEach(el => {
            el.addEventListener('click', () => {
                const idx = el.dataset.idx;
                const val = parseInt(el.dataset.val);
                document.querySelectorAll(`#av-edit-estrelas-${idx} .estrela-sel`).forEach((e, i) => {
                    e.classList.toggle('ativa', i < val);
                });
            });
        });

    } catch (e) {
        lista.innerHTML = '<p class="sem-avaliacoes">Erro ao carregar avaliações.</p>';
        console.error(e);
    }
}

// ----- MENU ⋯ -----
function fecharTodosMenus() {
    document.querySelectorAll('.av-menu.aberto').forEach(m => m.classList.remove('aberto'));
}
document.addEventListener('click', fecharTodosMenus);

// ----- EDITAR -----
function editarAvaliacao(docId) {
    fecharTodosMenus();
    document.getElementById(`av-texto-${docId}`).style.display = 'none';
    document.getElementById(`av-edit-${docId}`).style.display = 'block';
}

function cancelarEdicao(docId) {
    document.getElementById(`av-texto-${docId}`).style.display = 'block';
    document.getElementById(`av-edit-${docId}`).style.display = 'none';
}

async function salvarEdicao(docId) {
    const novoTexto = document.getElementById(`av-edit-campo-${docId}`).value.trim();
    if (!novoTexto) return;
    const estrelasAtivas = document.querySelectorAll(`#av-edit-estrelas-${docId} .estrela-sel.ativa`).length;

    try {
        await updateDoc(doc(db, 'avaliacoes', docId), {
            texto: novoTexto,
            estrelas: estrelasAtivas || 5,
            editado: true
        });
        carregarAvaliacoes();
    } catch (e) {
        mostrarAviso('Erro ao salvar edição.');
    }
}

// ----- EXCLUIR (modal) -----
function excluirAvaliacao(docId) {
    fecharTodosMenus();
    idxParaExcluir = docId;
    modoAviso = false;
    document.querySelector('#modal-excluir .modal-texto').textContent = 'Excluir esta avaliação?';
    document.getElementById('modal-confirmar').style.display = '';
    document.getElementById('modal-cancelar').textContent = 'Cancelar';
    document.getElementById('modal-excluir').classList.add('aberto');
}