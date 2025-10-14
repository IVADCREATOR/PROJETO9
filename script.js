// =================================================================
// 1. CONFIGURAÇÕES E INICIALIZAÇÃO DO FIRESTORE
// =================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDxAit93bJOJ1uuxaEcTsin9f3PlhKW_sY",
    authDomain: "bananas-koki.firebaseapp.com",
    projectId: "bananas-koki", 
    appId: "1:40465389507:web:17157871a1ebb6e4f24f76"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let siteData = {};
let currentCategoryKey = null;

// =================================================================
// 2. FUNÇÕES DE RENDERIZAÇÃO
// =================================================================

/**
 * Renderiza o cabeçalho e o rodapé com as informações da empresa.
 * @param {object} settings - Dados de configuração do site.
 */
function renderInfo(settings) {
    const defaultWhatsapp = "5511999999999";
    const whatsapp = settings.whatsapp || defaultWhatsapp;
    
    // Renderizar Header
    document.getElementById('site-header').innerHTML = `
        <h1 class="site-title">${settings.siteName || "BANANAS KOKI"}</h1>
        <div class="contact-links">
            <a href="https://wa.me/${whatsapp}" target="_blank">WhatsApp</a>
            <a href="https://instagram.com/${settings.instagram.replace('@', '')}" target="_blank">Instagram</a>
        </div>
    `;
    document.getElementById('site-title-tag').innerText = settings.siteName || "Bananas Koki";

    // Renderizar Footer
    document.getElementById('site-footer').innerHTML = `
        <div class="company-info">
            <p style="font-size: 1.2em; font-weight: bold;">${settings.siteName || "BANANAS KOKI"}</p>
            <p>O Sabor da Sua Saúde - Fornecemos as melhores bananas, frescas e de alta qualidade, direto do produtor.</p>
            <p>Fale conosco: ${whatsapp} | Siga-nos: ${settings.instagram || '@bananaskoki'}</p>
            <p style="margin-top: 15px; font-size: 0.8em;">© ${new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>
    `;
}

/**
 * Renderiza os botões de categoria (abas).
 */
function renderCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    let tabsHTML = '';

    const categories = siteData.categories || {};
    const categoryKeys = Object.keys(categories);

    if (categoryKeys.length === 0) {
        tabsContainer.innerHTML = '<p style="color: #6A1B9A;">Nenhuma categoria disponível no momento.</p>';
        return;
    }

    categoryKeys.forEach(key => {
        const category = categories[key];
        const isActive = key === currentCategoryKey ? 'active' : '';

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
    const category = siteData.categories[categoryKey];
    
    if (!category || !category.products) {
         grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Nenhum produto encontrado nesta categoria.</p>';
         return;
    }

    const products = Object.values(category.products); // Converte o objeto de produtos em array
    let productsHTML = '';
    const whatsappNumber = siteData.settings.whatsapp;

    products.forEach(product => {
        // Gera o link do WhatsApp com mensagem pré-preenchida
        const waLink = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20a%20${product.name}%20(R%24%20${product.price.toFixed(2).replace('.', ',')}).`;

        productsHTML += `
            <div class="product-card">
                <img src="${product.imgUrl}" alt="${product.name}" class="product-image">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                <a href="${waLink}" target="_blank">
                    <button class="whatsapp-button">Pedir por WhatsApp</button>
                </a>
            </div>
        `;
    });

    grid.innerHTML = productsHTML;
}

// =================================================================
// 3. FUNÇÃO DE INTERATIVIDADE E INICIALIZAÇÃO
// =================================================================

/**
 * Filtra e exibe os produtos de uma determinada categoria.
 * @param {string} key - A chave da categoria ('prata', 'nanica', etc.)
 * @param {HTMLElement} element - O botão que foi clicado.
 */
function filterProducts(key, element) {
    currentCategoryKey = key;
    
    // 1. Atualiza o estado das abas
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // O elemento pode ser nulo se for a primeira inicialização
    if (element) {
        element.classList.add('active');
    } else {
        // Ativa o primeiro botão correspondente
        const initialButton = document.querySelector(`.tab-button[onclick*="'${key}'"]`);
        if (initialButton) {
            initialButton.classList.add('active');
        }
    }

    // 2. Renderiza a nova lista de produtos
    renderProducts(key);
}

/**
 * Carrega todos os dados do Firestore para o site público.
 */
async function initializeApp() {
    try {
        const data = {
            settings: {},
            categories: {}
        };

        // 1. Carregar Configurações Gerais (Leitura é liberada pelas Rules)
        const settingsDoc = await db.collection('settings').doc('site_config').get();
        if (settingsDoc.exists) {
            data.settings = settingsDoc.data();
        }

        // 2. Carregar Categorias (incluindo subcoleção 'products')
        const categoriesSnapshot = await db.collection('categories').get();
        
        for (const doc of categoriesSnapshot.docs) {
            const categoryKey = doc.id;
            const categoryData = doc.data();
            data.categories[categoryKey] = { ...categoryData, products: {} };

            // Carregar Produtos da Subcoleção
            const productsSnapshot = await db.collection('categories').doc(categoryKey).collection('products').get();
            productsSnapshot.forEach(prodDoc => {
                data.categories[categoryKey].products[prodDoc.id] = prodDoc.data();
            });
        }
        
        siteData = data;

        // Determinar a categoria inicial
        const categoryKeys = Object.keys(siteData.categories);
        if (categoryKeys.length > 0) {
            currentCategoryKey = categoryKeys[0]; 
        }

        // Renderiza tudo
        renderInfo(siteData.settings);
        renderCategoryTabs();
        
        if (currentCategoryKey) {
            renderProducts(currentCategoryKey);
        } else {
            document.getElementById('products-grid').innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">O site ainda não possui produtos ou categorias. Por favor, acesse o Painel ADM.</p>';
        }

    } catch (error) {
        console.error("Erro fatal ao carregar o site:", error);
        document.getElementById('site-container').innerHTML = `
            <div style="text-align: center; margin-top: 100px; color: red;">
                <h1>Erro de Conexão</h1>
                <p>Não foi possível carregar os dados do site. Verifique a conexão com o Firebase.</p>
            </div>
        `;
    }
}

// Inicia a aplicação ao carregar o script
initializeApp();
