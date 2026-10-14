// ===== FIREBASE (mesma configuração do site) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyATn1yWqgYFj0c_9ShfEN_QFIM0a79LG6E",
    authDomain: "estudio-da-praca.firebaseapp.com",
    projectId: "estudio-da-praca",
    storageBucket: "estudio-da-praca.firebasestorage.app",
    messagingSenderId: "169699076157",
    appId: "1:169699076157:web:0f56f081cbaad77d182254"
};

const auth = getAuth(initializeApp(firebaseConfig));

// Para onde o usuário vai depois de entrar
const DESTINO = 'index.html#avaliacoes';

// ===== ELEMENTOS =====
const formLogin = document.getElementById('form-login');
const formCadastro = document.getElementById('form-cadastro');
const loginMsg = document.getElementById('login-msg');
const cadMsg = document.getElementById('cad-msg');

function mostrarMsg(el, texto, ok = false) {
    el.textContent = texto;
    el.classList.toggle('ok', ok);
}

function traduzirErro(codigo) {
    switch (codigo) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'E-mail ou senha incorretos.';
        case 'auth/invalid-email':
            return 'E-mail inválido.';
        case 'auth/email-already-in-use':
            return 'Este e-mail já está cadastrado.';
        case 'auth/weak-password':
            return 'A senha deve ter ao menos 6 caracteres.';
        case 'auth/too-many-requests':
            return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
        case 'auth/network-request-failed':
            return 'Sem conexão. Verifique sua internet.';
        default:
            return 'Algo deu errado. Tente novamente.';
    }
}

// ===== ALTERNAR LOGIN <-> CADASTRO =====
function trocarForm(mostrarCadastro) {
    formLogin.hidden = mostrarCadastro;
    formCadastro.hidden = !mostrarCadastro;
    mostrarMsg(loginMsg, '');
    mostrarMsg(cadMsg, '');
}

document.getElementById('ir-cadastro').addEventListener('click', () => trocarForm(true));
document.getElementById('ir-login').addEventListener('click', () => trocarForm(false));

// Permite abrir direto no cadastro: login.html#cadastro
if (location.hash === '#cadastro') trocarForm(true);

// ===== MOSTRAR / OCULTAR SENHA =====
document.querySelectorAll('.olho').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.alvo);
        input.type = input.type === 'password' ? 'text' : 'password';
    });
});

// ===== LOGIN =====
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const btn = document.getElementById('btn-entrar');

    if (!email || !senha) {
        mostrarMsg(loginMsg, 'Preencha e-mail e senha.');
        return;
    }

    btn.disabled = true;
    mostrarMsg(loginMsg, '');
    try {
        await signInWithEmailAndPassword(auth, email, senha);
        location.href = DESTINO;
    } catch (err) {
        mostrarMsg(loginMsg, traduzirErro(err.code));
        btn.disabled = false;
    }
});

// ===== ESQUECI A SENHA =====
document.getElementById('btn-esqueci').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    if (!email) {
        mostrarMsg(loginMsg, 'Digite seu e-mail acima e clique de novo em "Esqueceu a senha?".');
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        mostrarMsg(loginMsg, 'Enviamos um link de redefinição para o seu e-mail.', true);
    } catch (err) {
        mostrarMsg(loginMsg, traduzirErro(err.code));
    }
});

// ===== CADASTRO =====
formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const btn = document.getElementById('btn-cadastrar');

    if (!nome || !email || !senha) {
        mostrarMsg(cadMsg, 'Preencha todos os campos.');
        return;
    }
    if (senha.length < 6) {
        mostrarMsg(cadMsg, 'A senha deve ter ao menos 6 caracteres.');
        return;
    }

    btn.disabled = true;
    mostrarMsg(cadMsg, '');
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);
        await updateProfile(cred.user, { displayName: nome });
        location.href = DESTINO;
    } catch (err) {
        mostrarMsg(cadMsg, traduzirErro(err.code));
        btn.disabled = false;
    }
});

// ===== JÁ LOGADO? Vai direto para o site =====
onAuthStateChanged(auth, (user) => {
    if (user) location.replace(DESTINO);
});
