// =================================================================
// 1. DADOS INICIAIS (SIMULAÇÃO DO BANCO DE DADOS/ADM)
// Este objeto seria o dado lido do Firebase no futuro.
// =================================================================
const siteData = {
    settings: {
        siteName: "BANANAS KOKI",
        description: "O Sabor da Sua Saúde - Fornecemos as melhores bananas, frescas e de alta qualidade, direto do produtor.",
        whatsapp: "5511987654321",
        instagram: "@bananaskoki",
        bgUrl: "future_background_image_url.jpg" // Placeholder para ADM
    },
    categories: {
        nanica: {
            name: "Nanica",
            products: [
                { id: "n1", name: "Nanica Premium (Kg)", price: 8.90, imgUrl: "https://via.placeholder.com/400x200/FFEB3B/333?text=Nanica+Premium" },
                { id: "n2", name: "Nanica Orgânica (Dúzia)", price: 12.50, imgUrl: "https://via.placeholder.com/400x200/FFEB3B/333?text=Nanica+Org%C3%A2nica" }
            ]
        },
        prata: {
            name: "Prata",
            products: [
                { id: "p1", name: "Prata Extra (Kg)", price: 6.50, imgUrl: "https://via.placeholder.com/400x200/FFC107/333?text=Prata+Extra" },
                { id: "p2", name: "Prata Pacote (5kg)", price: 28.00, imgUrl: "https://via.placeholder.com/400x200/FFC107/333?text=Prata+Pacote" }
            ]
        },
        ouro: {
            name: "Ouro",
            products: [
                { id: "o1", name: "Ouro Pequena (Dúzia)", price: 15.90, imgUrl: "https://via.placeholder.com/400x200/FFD700/333?text=Banana+Ouro" },
                { id: "o2", name: "Ouro Desidratada (100g)", price: 9.50, imgUrl: "https://via.placeholder.com/400x200/FFD700/333?text=Ouro+Desidratada" }
            ]
        },
        terra: {
            name: "Terra",
            products: [
                { id: "t1", name: "Terra Para Cozido (Kg)", price: 5.20, imgUrl: "https://via.placeholder.com/400x200/8BC34A/333?text=Banana+Terra" }
            ]
        }
    }
};

let currentCategory = 'nanica'; // Categoria padrão ao carregar

// =================================================================
// 2. CONEXÃO COM O FIREBASE (Preparação para ADM)
// =================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDxAit93bJOJ1uuxaEcTsin9f3PlhKW_sY",
    databaseURL: "https://bananas-koki-default-rtdb.firebaseio.com", 
    // ... outros dados ...
};
// firebase.initializeApp(firebaseConfig); // Descomente para ativar a conexão com o ADM

// function fetchSiteData() {
//    // Lógica futura para ler os dados do Firebase Realtime DB
// }


// =================================================================
// 3. FUNÇÕES DE RENDERIZAÇÃO
// =================================================================

/**
 * Renderiza os botões de categoria (abas).
 */
function renderCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    let tabsHTML = '';

    Object.keys(siteData.categories).forEach(key => {
        const category = siteData.categories[key];
        const isActive = key === currentCategory ? 'active' : '';

        // O evento onclick chama a função para filtrar os produtos
        tabsHTML += `
            <button class="tab-button ${isActive}" onclick="filterProducts('${key}', this)">
                ${category.name}
            </button>
        `;
    });

    tabsContainer.innerHTML = tabsHTML;
}

/**
 * Renderiza os cards de produtos da categoria selecionada.
 * @param {string} categoryKey - A chave da categoria a ser exibida.
 */
function renderProducts(categoryKey) {
    const grid = document.getElementById('products-grid');
    const products = siteData.categories[categoryKey].products;
    let productsHTML = '';

    products.forEach(product => {
        productsHTML += `
            <div class="product-card">
                <img src="${product.imgUrl}" alt="${product.name}" class="product-image">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                <button class="admin-button" style="margin-top: 15px; background-color: #E65100;">Pedir por WhatsApp</button>
            </div>
        `;
    });

    grid.innerHTML = productsHTML;
}

/**
 * Renderiza o cabeçalho e o rodapé com as informações da empresa.
 */
function renderInfo() {
    const settings = siteData.settings;
    
    // Renderizar Header
    document.getElementById('site-header').innerHTML = `
        <h1 class="site-title">${settings.siteName}</h1>
        <div class="contact-links">
            <a href="https://wa.me/${settings.whatsapp}" target="_blank">WhatsApp</a>
            <a href="https://instagram.com/${settings.instagram.replace('@', '')}" target="_blank">Instagram</a>
        </div>
    `;

    // Renderizar Footer
    document.getElementById('site-footer').innerHTML = `
        <div class="company-info">
            <p style="font-size: 1.2em; font-weight: bold;">${settings.siteName}</p>
            <p>${settings.description}</p>
            <p>Fale conosco: ${settings.whatsapp} | Siga-nos: ${settings.instagram}</p>
            <p style="margin-top: 15px; font-size: 0.8em;">© ${new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
    `;
}

// =================================================================
// 4. FUNÇÃO DE INTERATIVIDADE E INICIALIZAÇÃO
// =================================================================

/**
 * Filtra e exibe os produtos de uma determinada categoria.
 * @param {string} key - A chave da categoria ('prata', 'nanica', etc.)
 * @param {HTMLElement} element - O botão que foi clicado.
 */
function filterProducts(key, element) {
    currentCategory = key;
    
    // 1. Atualiza o estado das abas
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    // 2. Renderiza a nova lista de produtos
    renderProducts(key);
}

/**
 * Inicializa todo o site.
 */
function initializeApp() {
    // 1. Renderiza informações básicas (Header/Footer)
    renderInfo(); 
    
    // 2. Renderiza os botões das categorias
    renderCategoryTabs();
    
    // 3. Renderiza os produtos da categoria padrão ('nanica')
    renderProducts(currentCategory); 
}

// Inicia o aplicativo ao carregar o script
initializeApp();
