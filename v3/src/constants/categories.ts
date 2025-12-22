
// Sistema de Categorías y Subcategorías para Tribu Impulsa 2.0
// Diseñado para cubrir el 99% de los casos de uso de emprendedores en Chile

export const CATEGORIES = [
    {
        name: 'Moda Mujer',
        subcategories: [
            'Ropa de mujer',
            'Vestidos de fiesta',
            'Joyas/Bijouterie',
            'Zapatos',
            'Carteras',
            'Cosméticos/Skincare',
            'Accesorios varios'
        ]
    },
    {
        name: 'Moda Hombre',
        subcategories: [
            'Ropa de hombre',
            'Zapatos/Zapatillas',
            'Accesorios hombre'
        ]
    },
    {
        name: 'Belleza, Estética y Bienestar',
        subcategories: [
            'Peluquería/Barbería',
            'Manicure/Pedicure',
            'Cejas/Pestañas',
            'Centro de estética',
            'Maquillaje',
            'Masoterapia',
            'Terapias alternativas',
            'Personal Trainer',
            'Nutricionista'
        ]
    },
    {
        name: 'Alimentos y Gastronomía',
        subcategories: [
            'Restaurante/Café',
            'Pastelería/Repostería',
            'Panadería',
            'Comida saludable',
            'Productos gourmet',
            'Catering',
            'Delivery',
            'Food truck'
        ]
    },
    {
        name: 'Negocio', // Retail/Comercio
        subcategories: [
            'Decoración/Hogar',
            'Muebles',
            'Artículos deportivos',
            'Packaging',
            'Impresión/Branding',
            'Tecnología/Electrónicos',
            'Librería',
            'Comercio internacional'
        ]
    },
    {
        name: 'Servicios Profesionales',
        subcategories: [
            'Abogados',
            'Contadores',
            'Arquitectos',
            'Psicólogos',
            'Coaching',
            'Dentistas',
            'Kinesiólogos',
            'Corredores seguros',
            'Corredores propiedades'
        ]
    },
    {
        name: 'Educación y Capacitación',
        subcategories: [
            'Clases particulares',
            'Cursos idiomas',
            'Talleres arte/música',
            'Coaching/Mentoring',
            'Educación financiera',
            'Plataforma educativa'
        ]
    },
    {
        name: 'Arte, Diseño y Creatividad',
        subcategories: [
            'Fotografía/Video',
            'Diseño gráfico',
            'Ilustración',
            'Pintura/Cerámica',
            'Marketing digital',
            'Producción audiovisual'
        ]
    },
    {
        name: 'Construcción y Mantención',
        subcategories: [
            'Remodelación',
            'Paisajismo',
            'Piscinas',
            'Paneles solares',
            'Fumigación'
        ]
    },
    {
        name: 'Tecnología y Desarrollo',
        subcategories: [
            'Desarrollo software',
            'Hosting/Dominios',
            'Soporte técnico',
            'E-commerce',
            'Ciberseguridad',
            'Automatización/IA'
        ]
    },
    {
        name: 'Turismo',
        subcategories: [
            'Agencia viajes',
            'Hotelería',
            'Guías turísticos',
            'Viñas'
        ]
    },
    {
        name: 'Eventos',
        subcategories: [
            'Centro de eventos',
            'Matrimonios',
            'Cumpleaños',
            'Eventos corporativos',
            'DJs',
            'Food truck',
            'Globos/Decoración'
        ]
    },
    {
        name: 'Transporte y Logística',
        subcategories: [
            'Delivery',
            'Mudanzas',
            'Transporte pasajeros',
            'Rent a Car',
            'Logística e-commerce'
        ]
    },
    {
        name: 'Mascotas y Animales',
        subcategories: [
            'Peluquería mascotas',
            'Alimentos mascotas',
            'Accesorios mascotas',
            'Veterinaria',
            'Paseo perros',
            'Hotel mascotas'
        ]
    },
    {
        name: 'Industria y Manufactura',
        subcategories: [
            'Jabones artesanales',
            'Productos limpieza',
            'Envases',
            'Cerveza/Bebidas artesanales'
        ]
    },
    {
        name: 'Oficio',
        subcategories: [
            'Carpintero',
            'Electricista',
            'Jardinero',
            'Mecánico',
            'Limpieza',
            'Modista/Arreglos'
        ]
    },
    {
        name: 'Otro',
        subcategories: ['Otro']
    }
];

export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);
