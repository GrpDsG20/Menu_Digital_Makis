var cartOpen = false;
var numberOfProducts = 0;

// Listeners para eventos
$('body').on('click', '.js-toggle-cart', toggleCart);
// Modificamos el evento de añadir producto al carrito para que funcione con el contenedor completo.
$('body').on('click', '.products__item', addProduct);
$('body').on('click', '.js-remove-product', removeProduct);
// Listener para actualizar el precio cuando cambia la cantidad
$('body').on('input', '.cart-product__quantity', updateProductPrice);

// Listener para el botón "Buy products"
$('body').on('click', '.js-buy-products', function (e) {
  e.preventDefault();
  sendWhatsAppOrder(); // Enviar pedido por WhatsApp al hacer clic en "Buy products"
});

// Función para abrir/cerrar el carrito
function toggleCart(e) {
  e.preventDefault();
  if (cartOpen) {
    closeCart();
    return;
  }
  openCart();
}

function openCart() {
  cartOpen = true;
  $('body').addClass('open');
}

function closeCart() {
  cartOpen = false;
  $('body').removeClass('open');
}

// Agregar un producto al carrito
function addProduct(e) {
  e.preventDefault();

  // Obtener el título y el precio del producto desde el contenedor .products__item que fue clickeado
  var productTitle = $(this).find('.product__title').text();
  var productPrice = parseFloat($(this).find('.js-product-price').text()).toFixed(2); // Convertir a número

  // Crear una nueva fila en el carrito usando la plantilla
  var productHTML = $('.js-cart-product-template').html();

  // Actualizar el contenido de la plantilla con los datos del producto
  var newProduct = $(productHTML);
  newProduct.find('.cart-product__title').text(productTitle);
  newProduct.find('.js-cart-product-price').text(productPrice).data('unit-price', productPrice); // Guardar precio unitario en data

  // Agregar el nuevo producto al carrito
  $('.js-cart-products').prepend(newProduct);

  numberOfProducts++;
  updateProductCounter();
  updateCartTotal(); // Actualizar el total
  $('.js-cart-empty').addClass('hide');
}

// Eliminar un producto del carrito
function removeProduct(e) {
  e.preventDefault();
  $(this).closest('.js-cart-product').remove();
  numberOfProducts--;
  if (numberOfProducts === 0) {
    $('.js-cart-empty').removeClass('hide');
  }
  updateProductCounter();
  updateCartTotal(); // Actualizar el total
}

// Actualizar el contador de productos
function updateProductCounter() {
  // Actualiza el contador de productos en el botón "View Cart"
  $('.js-cart-counter').text(numberOfProducts);
}

// Actualizar el precio del producto cuando cambia la cantidad
function updateProductPrice(e) {
  var quantityInput = $(this); // El input que se modificó
  var product = quantityInput.closest('.js-cart-product'); // Contenedor del producto
  var unitPrice = parseFloat(product.find('.js-cart-product-price').data('unit-price')); // Precio unitario
  var quantity = parseInt(quantityInput.val(), 10) || 1; // Valor del input o 1 si está vacío

  // Calcular el nuevo precio total del producto
  var newPrice = (unitPrice * quantity).toFixed(2);
  product.find('.js-cart-product-price').text(newPrice);

  // Actualizar el total del carrito
  updateCartTotal();
}

// Actualizar el total del carrito
function updateCartTotal() {
  var total = 0;

  // Iterar sobre todos los productos en el carrito
  $('.js-cart-product').each(function () {
    var unitPrice = parseFloat($(this).find('.js-cart-product-price').data('unit-price'));
    var quantity = parseInt($(this).find('.cart-product__quantity').val()) || 1;
    if (unitPrice > 0) {
      total += unitPrice * quantity; // Calcular subtotal de cada producto
    }
  });

  // Actualizar el total en el HTML
  $('.js-cart-total').text(total.toFixed(2));
}

// Enviar pedido por WhatsApp
function sendWhatsAppOrder() {
  var productsMessage = "Hola, me gustaria realizar el siguiente pedido:\n\n";

  // Recorrer los productos del carrito
  $('.js-cart-product').each(function () {
    var productTitle = $(this).find('.cart-product__title').text();
    var unitPrice = parseFloat($(this).find('.js-cart-product-price').data('unit-price'));
    var productQuantity = parseInt($(this).find('.cart-product__quantity').val()) || 1;

    // Solo incluir productos cuyo precio sea mayor a 0.00
    if (unitPrice > 0) {
      productsMessage += `Producto: ${productTitle}\nPrecio unitario: ${unitPrice.toFixed(2)}\nCantidad: ${productQuantity}\nSubtotal: ${(unitPrice * productQuantity).toFixed(2)}\n\n`;
    }
  });

  // Calcular el total
  var total = parseFloat($('.js-cart-total').text()) || 0;
  productsMessage += `Total: S/. ${total.toFixed(2)}\n\n`;

  // Obtener la dirección del usuario
  var userAddress = document.getElementById('address').value.trim();

  // Verificar si se ingresó una dirección
  if (userAddress) {
    // Crear enlace de Google Maps
    var mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userAddress)}`;
    productsMessage += `Dirección: ${userAddress}\nVer en Google Maps: ${mapsLink}\n\n`;
  } else {
    productsMessage += `Dirección: No proporcionada.\n\n`;
  }

  productsMessage += "Confirmo que mi orden es correcta.";

  // Número de teléfono de destino (sin el símbolo +)
  var phoneNumber = "51999999999";  // Código de país de Perú (51) + número de teléfono

  // Detectamos el ancho de la pantalla para determinar si es móvil o escritorio
  var isMobile = window.innerWidth <= 768; // Este valor puede ajustarse según lo necesites (768px es un valor común para móvil)

  if (isMobile) {
    // Enviar el mensaje a la aplicación WhatsApp (móvil)
    var whatsappLink = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(productsMessage)}`;
    window.location.href = whatsappLink;
  } else {
    // Si es escritorio, abrir WhatsApp Web
    var whatsappWebLink = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(productsMessage)}`;
    window.open(whatsappWebLink, '_blank');
  }
}


