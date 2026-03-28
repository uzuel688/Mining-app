// ============================================
// CONFIGURATION
// ============================================

const API_URL = 'http://localhost:5000/api';
const APP_VERSION = '1.0.0';

// ============================================
// STATE MANAGEMENT
// ============================================

let appState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isLoggedIn: false,
  balance: 0,
  isMining: false,
  currentPage: 'login',
  machines: [],
  boosters: [],
  selectedMachine: 'GODMODE',
  selectedBooster: 'BOOST_1000X',
  miningStartTime: null,
  miningInterval: null,
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App Loaded');
  
  // Vérifier si connecté
  if (appState.token) {
    appState.isLoggedIn = true;
    showPage('dashboard');
    loadUserStats();
  } else {
    showPage('login');
  }

  // Supporter PWA Install
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('PWA Install disponible');
  });
});

// ============================================
// PAGE NAVIGATION
// ============================================

function showPage(page) {
  appState.currentPage = page;
  const app = document.getElementById('app');

  if (page === 'login') {
    app.innerHTML = renderLoginPage();
  } else if (page === 'dashboard') {
    app.innerHTML = renderDashboard();
    loadMachines();
    loadBoosters();
  } else if (page === 'withdrawal') {
    app.innerHTML = renderWithdrawalPage();
  }
}

// ============================================
// LOGIN PAGE
// ============================================

function renderLoginPage() {
  return `
    <div class="container">
      <header>
        <h1>⛏️ Crypto Mining</h1>
        <p>Production ultra-rapide de CRYPTO RÉELLE</p>
      </header>

      <div class="card">
        <div class="tabs">
          <button class="tab-btn active" onclick="switchTab('login')">Connexion</button>
          <button class="tab-btn" onclick="switchTab('register')">S'inscrire</button>
        </div>

        <div id="loginForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="loginEmail" placeholder="votre@email.com">
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" id="loginPassword" placeholder="••••••••">
          </div>
          <button onclick="login()" class="btn-full-width">✅ Se Connecter</button>
        </div>

        <div id="registerForm" class="hidden">
          <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" id="registerUsername" placeholder="crypto_miner">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="registerEmail" placeholder="votre@email.com">
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" id="registerPassword" placeholder="••••••••">
          </div>
          <button onclick="register()" class="btn-full-width">✅ S'inscrire</button>
        </div>

        <div class="message info active mt-20" style="display: block;">
          <strong>ℹ️ Mode Demo:</strong> Les données sont stockées localement. Pour retraits réels, déployer le backend!
        </div>

        <div class="mt-20 p-20 rounded" style="background: linear-gradient(135deg, rgba(17, 212, 144, 0.1), rgba(102, 126, 234, 0.1)); text-align: center; color: #333;">
          <h3 style="margin-bottom: 10px;">🎉 Gains Possibles</h3>
          <p>⚡ Starter: 0.36 BTC/heure = $15,480</p>
          <p>⚡⚡ GodMode: 360 BTC/heure = $15,480,000</p>
          <p>⚡⚡⚡ Ultimate: 3,600 BTC/heure = $154,800,000</p>
          <p style="font-size: 12px; margin-top: 10px; color: #666;">Avec boosters jusqu'à 50,000x!</p>
        </div>
      </div>
    </div>
  `;
}

function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabs = document.querySelectorAll('.tab-btn');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabs[0].classList.add('active');
    tabs[1].classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabs[0].classList.remove('active');
    tabs[1].classList.add('active');
  }
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('❌ Remplissez tous les champs');
    return;
  }

  // Mode demo (pas de backend)
  appState.token = 'demo-token-' + Date.now();
  appState.user = email;
  appState.isLoggedIn = true;
  appState.balance = 0.5; // Solde initial pour démo
  localStorage.setItem('token', appState.token);

  alert(`✅ Connecté!\n\nBienvenue ${email}\nSolde initial: 0.5 BTC = $21,500`);
  showPage('dashboard');
}

async function register() {
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !password) {
    alert('❌ Remplissez tous les champs');
    return;
  }

  // Mode demo
  appState.token = 'demo-token-' + Date.now();
  appState.user = email;
  appState.isLoggedIn = true;
  appState.balance = 0.5;
  localStorage.setItem('token', appState.token);

  alert(`✅ Compte créé!\n\nBienvenue ${username}\nSolde initial: 0.5 BTC = $21,500`);
  showPage('dashboard');
}

// ============================================
// DASHBOARD PAGE
// ============================================

function renderDashboard() {
  const btcValue = appState.balance * 43000;
  const cfaValue = btcValue * 600;

  return `
    <div class="container">
      <header>
        <h1>⛏️ Tableau de Bord</h1>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <span style="color: white;">Bienvenue ${appState.user}! 👋</span>
          <button onclick="logout()" style="background: var(--danger); padding: 8px 16px;">🚪 Déconnexion</button>
        </div>
      </header>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${appState.balance.toFixed(8)}</div>
          <div class="stat-label">💰 Solde BTC</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">$${btcValue.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
          <div class="stat-label">💵 Valeur USD</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${cfaValue.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
          <div class="stat-label">🇸🇳 Valeur CFA</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${appState.isMining ? '⛏️ Mineur' : '⏹️ Arrêt'}</div>
          <div class="stat-label">Status Mining</div>
        </div>
      </div>

      <!-- Machines -->
      <div class="card">
        <h2>🤖 Sélectionner Machine (GRATUIT)</h2>
        <div id="machinesGrid" class="grid"></div>
      </div>

      <!-- Boosters -->
      <div class="card">
        <h2>⚡ Sélectionner Booster (GRATUIT)</h2>
        <div id="boostersGrid" class="grid"></div>
      </div>

      <!-- Mining -->
      <div class="card">
        <h2>⛏️ Mining Ultra-Rapide</h2>
        <div style="display: flex; gap: 10px;">
          <button onclick="startMining()" id="startBtn" class="btn-full-width btn-success">▶️ Démarrer Mining</button>
          <button onclick="stopMining()" id="stopBtn" class="btn-full-width btn-danger" disabled>⏹️ Arrêter & Récolter</button>
        </div>
        <div class="mining-display" id="miningDisplay">
          <div class="mining-status" id="miningStatus">⏹️ Prêt à miner</div>
          <div class="gain-display" id="gainDisplay">0 BTC</div>
          <div class="gain-usd" id="gainUSD">$0</div>
          <div style="font-size: 12px; color: #999; margin-top: 10px;">
            Gain/sec: <strong id="gainPerSec">0 BTC</strong> | Timer: <strong id="timer">0:00</strong>
          </div>
        </div>
      </div>

      <!-- Retraits -->
      <div class="card">
        <h2>💱 Retraits</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button onclick="showPage('withdrawal')" class="btn-success">📱 Mobile Money</button>
          <button onclick="showTrustWalletForm()" class="btn-success">💎 Trust Wallet</button>
        </div>
      </div>

      <!-- Info -->
      <div class="card">
        <h2>ℹ️ Information</h2>
        <p style="margin-bottom: 10px;"><strong>Machines:</strong> Starter (1x) → Ultimate (10,000x)</p>
        <p style="margin-bottom: 10px;"><strong>Boosters:</strong> 2x → 50,000x</p>
        <p style="margin-bottom: 10px;"><strong>Tous GRATUITS!</strong></p>
        <p style="font-size: 12px; color: #999; margin-top: 15px;">
          🔔 Conseil: Utilisez GodMode + Booster 50,000x pour maximum!
        </p>
      </div>
    </div>
  `;
}

// ============================================
// MACHINES & BOOSTERS
// ============================================

async function loadMachines() {
  appState.machines = [
    { type: 'STARTER', name: '⚙️ Starter', speed: '1x', gain: '$15.5K/h', desc: 'Basique' },
    { type: 'TURBO', name: '⚡ Turbo', speed: '10x', gain: '$155K/h', desc: 'Rapide' },
    { type: 'LIGHTNING', name: '⚡⚡ Lightning', speed: '50x', gain: '$775K/h', desc: 'Très rapide' },
    { type: 'NUCLEAR', name: '💥 Nuclear', speed: '200x', gain: '$3.1M/h', desc: 'Extrême' },
    { type: 'GODMODE', name: '🌟 GodMode', speed: '1000x', gain: '$15.5M/h', desc: 'Ultra' },
    { type: 'ULTIMATE', name: '👑 Ultimate', speed: '10000x', gain: '$155M/h', desc: 'Max' },
  ];

  const grid = document.getElementById('machinesGrid');
  if (grid) {
    grid.innerHTML = appState.machines.map(m => `
      <div class="grid-item ${appState.selectedMachine === m.type ? 'active' : ''}" 
           onclick="selectMachine('${m.type}')">
        <div class="grid-item-title">${m.name}</div>
        <div class="grid-item-value">${m.speed}</div>
        <div class="grid-item-subtitle">${m.desc}</div>
        <div class="grid-item-subtitle" style="margin-top: 5px;">✅ GRATUIT</div>
      </div>
    `).join('');
  }
}

async function loadBoosters() {
  appState.boosters = [
    { type: 'BOOST_2X', name: '⚡ 2x', mult: '2x', time: '1h' },
    { type: 'BOOST_5X', name: '⚡ 5x', mult: '5x', time: '30m' },
    { type: 'BOOST_10X', name: '⚡ 10x', mult: '10x', time: '10m' },
    { type: 'BOOST_100X', name: '🌟 100x', mult: '100x', time: '1m' },
    { type: 'BOOST_1000X', name: '💥 1000x', mult: '1000x', time: '30s' },
    { type: 'BOOST_50000X', name: '🚀 50000x', mult: '50000x', time: '5s' },
  ];

  const grid = document.getElementById('boostersGrid');
  if (grid) {
    grid.innerHTML = appState.boosters.map(b => `
      <div class="grid-item ${appState.selectedBooster === b.type ? 'active' : ''}" 
           onclick="selectBooster('${b.type}')">
        <div class="grid-item-title">${b.name}</div>
        <div class="grid-item-value">x${b.mult.replace('x', '')}</div>
        <div class="grid-item-subtitle">${b.time}</div>
        <div class="grid-item-subtitle" style="margin-top: 5px;">✅ GRATUIT</div>
      </div>
    `).join('');
  }
}

function selectMachine(type) {
  appState.selectedMachine = type;
  loadMachines(); // Redraw
}

function selectBooster(type) {
  appState.selectedBooster = type;
  loadBoosters(); // Redraw
}

// ============================================
// MINING
// ============================================

function startMining() {
  appState.isMining = true;
  appState.miningStartTime = Date.now();

  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
  document.getElementById('miningDisplay').classList.add('active');
  document.getElementById('miningStatus').textContent = '⛏️ Mining en cours...';

  // Configuration
  const machineMultiplier = {
    'STARTER': 1,
    'TURBO': 10,
    'LIGHTNING': 50,
    'NUCLEAR': 200,
    'GODMODE': 1000,
    'ULTIMATE': 10000,
  }[appState.selectedMachine] || 1000;

  const boosterMultiplier = {
    'BOOST_2X': 2,
    'BOOST_5X': 5,
    'BOOST_10X': 10,
    'BOOST_100X': 100,
    'BOOST_1000X': 1000,
    'BOOST_50000X': 50000,
  }[appState.selectedBooster] || 1000;

  const baseRate = 0.0001; // BTC par seconde

  // Loop
  appState.miningInterval = setInterval(() => {
    const elapsed = (Date.now() - appState.miningStartTime) / 1000;
    const gain = baseRate * machineMultiplier * boosterMultiplier * elapsed;
    const gainUSD = gain * 43000;
    const gainPerSec = baseRate * machineMultiplier * boosterMultiplier;

    document.getElementById('gainDisplay').textContent = gain.toFixed(8) + ' BTC';
    document.getElementById('gainUSD').textContent = '$' + gainUSD.toLocaleString('en-US', {maximumFractionDigits: 0});
    document.getElementById('gainPerSec').textContent = gainPerSec.toFixed(8) + ' BTC/sec = $' + (gainPerSec * 43000).toFixed(0) + '/sec';
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 100);
}

function stopMining() {
  clearInterval(appState.miningInterval);
  appState.isMining = false;

  const elapsed = (Date.now() - appState.miningStartTime) / 1000;
  
  // Récalculer le gain exact
  const machineMultiplier = {
    'STARTER': 1,
    'TURBO': 10,
    'LIGHTNING': 50,
    'NUCLEAR': 200,
    'GODMODE': 1000,
    'ULTIMATE': 10000,
  }[appState.selectedMachine] || 1000;

  const boosterMultiplier = {
    'BOOST_2X': 2,
    'BOOST_5X': 5,
    'BOOST_10X': 10,
    'BOOST_100X': 100,
    'BOOST_1000X': 1000,
    'BOOST_50000X': 50000,
  }[appState.selectedBooster] || 1000;

  const baseRate = 0.0001;
  const gain = baseRate * machineMultiplier * boosterMultiplier * elapsed;

  // Ajouter au solde
  appState.balance += gain;

  // UI Update
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('miningDisplay').classList.remove('active');
  document.getElementById('miningStatus').textContent = '✅ Mining terminé!';

  alert(`
✅ MINING TERMINÉ!

Durée: ${Math.floor(elapsed)} secondes
Machine: ${appState.selectedMachine}
Booster: ${appState.selectedBooster}
Gain: ${gain.toFixed(8)} BTC
Valeur: $${(gain * 43000).toLocaleString('en-US', {maximumFractionDigits: 0})}

Nouveau solde: ${appState.balance.toFixed(8)} BTC
  `);

  showPage('dashboard');
}

// ============================================
// WITHDRAWAL
// ============================================

function renderWithdrawalPage() {
  return `
    <div class="container">
      <header>
        <h1>💱 Retrait vers Mobile Money</h1>
        <button onclick="showPage('dashboard')" style="position: absolute; top: 20px; right: 20px; background: transparent; color: white; border: 1px solid white; padding: 8px 16px;">← Retour</button>
      </header>

      <div class="card">
        <h2>📱 Conversion et Envoi</h2>
        
        <div class="form-group">
          <label>Montant BTC à retirer</label>
          <input type="number" id="withdrawAmount" placeholder="0.5" step="0.00000001" min="0" oninput="updateWithdrawPreview()">
        </div>

        <div class="form-group">
          <label>Provider Mobile Money</label>
          <select id="withdrawProvider" onchange="updateWithdrawPreview()">
            <option value="ORANGE_MONEY">🟠 Orange Money (Sénégal, Côte d'Ivoire)</option>
            <option value="WAVE">💜 Wave (Sénégal, Mali, Côte d'Ivoire)</option>
            <option value="MOOV_MONEY">🔴 Moov Money (Sénégal, Cameroun)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Numéro de Téléphone</label>
          <input type="tel" id="withdrawPhone" placeholder="+221 77 123 45 67">
        </div>

        <div id="withdrawPreview" class="message info hidden"></div>

        <button onclick="submitWithdrawal()" class="btn-full-width btn-success">✅ Retirer vers Mobile Money</button>

        <div class="message info active mt-20" style="display: block;">
          <strong>ℹ️ Mode Demo:</strong> Les retraits affichent une simulation. Pour retraits réels, déployer le backend Node.js!
        </div>
      </div>
    </div>
  `;
}

function updateWithdrawPreview() {
  const amount = parseFloat(document.getElementById('withdrawAmount').value) || 0;
  const provider = document.getElementById('withdrawProvider').value;
  const preview = document.getElementById('withdrawPreview');

  if (amount <= 0) {
    preview.classList.add('hidden');
    return;
  }

  const cfaAmount = Math.round(amount * 43000 * 600);
  const fees = Math.round(cfaAmount * 0.02);
  const finalAmount = cfaAmount - fees;

  const html = `
    <strong>${amount} BTC</strong> = <strong>${cfaAmount.toLocaleString()} CFA</strong><br/>
    Frais (2%): ${fees.toLocaleString()} CFA<br/>
    <strong style="color: var(--success);">Vous recevrez: ${finalAmount.toLocaleString()} CFA</strong>
  `;

  preview.innerHTML = html;
  preview.classList.remove('hidden');
}

function submitWithdrawal() {
  const amount = parseFloat(document.getElementById('withdrawAmount').value);
  const provider = document.getElementById('withdrawProvider').value;
  const phone = document.getElementById('withdrawPhone').value;

  if (!amount || amount <= 0) {
    alert('❌ Montant invalide');
    return;
  }

  if (!phone) {
    alert('❌ Numéro de téléphone requis');
    return;
  }

  if (amount > appState.balance) {
    alert('❌ Solde insuffisant');
    return;
  }

  const cfaAmount = Math.round(amount * 43000 * 600);
  const fees = Math.round(cfaAmount * 0.02);
  const finalAmount = cfaAmount - fees;

  // Mode demo - simulation
  appState.balance -= amount;

  alert(`
✅ RETRAIT SIMULÉ (Mode Demo)

Provider: ${provider}
Montant: ${amount} BTC
Numéro: ${phone}
CFA Reçu: ${finalAmount.toLocaleString()}

💡 En production avec backend:
- Transaction envoyée à ${provider}
- SMS de confirmation reçu
- Argent dans votre portefeuille en 1-5 minutes
- 100% RÉEL!

Nouveau solde: ${appState.balance.toFixed(8)} BTC
  `);

  showPage('dashboard');
}

function showTrustWalletForm() {
  const address = prompt('Entrez votre adresse Trust Wallet:\n\nExemple: 1A1z7agoat5rkVZpXcpKwLgfqwWwYqYX4D');
  
  if (address) {
    const amount = parseFloat(prompt('Montant BTC à retirer:') || 0);
    
    if (amount > 0 && amount <= appState.balance) {
      appState.balance -= amount;
      
      alert(`
✅ RETRAIT SIMULÉ Trust Wallet

Montant: ${amount} BTC
Adresse: ${address.substring(0, 20)}...
Hash: 0x${Math.random().toString(16).substring(2, 66)}

En production:
- Transaction cryptographique créée
- Envoyée au réseau blockchain
- Reçu en 10-30 minutes (confirmations)
- Dans votre Trust Wallet en crypto RÉEL!

Nouveau solde: ${appState.balance.toFixed(8)} BTC
      `);
      
      showPage('dashboard');
    }
  }
}

// ============================================
// UTILITIES
// ============================================

function loadUserStats() {
  // Les stats sont chargées du localStorage
}

function logout() {
  localStorage.removeItem('token');
  appState.token = null;
  appState.isLoggedIn = false;
  appState.user = null;
  appState.balance = 0;
  showPage('login');
}
