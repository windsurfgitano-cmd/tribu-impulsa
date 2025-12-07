// ============================================
// CATEGORÍAS DE NEGOCIO - TRIBU IMPULSA
// ============================================
// Estructura: Grupo > Subgrupo > Categoría

export interface Category {
  id: string;
  label: string;
  group: string;
  subgroup: string;
}

export const CATEGORY_GROUPS = [
  'Moda Mujer',
  'Moda Hombre',
  'Negocio',
  'Alimentos y Gastronomía',
  'Belleza, Estética y Bienestar',
  'Servicios Profesionales',
  'Educación y Capacitación',
  'Arte, Diseño y Creatividad',
  'Construcción y Mantención',
  'Tecnología y Desarrollo',
  'Turismo',
  'Eventos',
  'Transporte y Logística',
  'Mascotas y Animales',
  'Industria y Manufactura',
  'Oficio',
  'Otro'
] as const;

export type CategoryGroup = typeof CATEGORY_GROUPS[number];

export const CATEGORIES: Category[] = [
  // ========== MODA MUJER - ROPA ==========
  { id: 'moda-mujer-jeans', label: 'Jeans', group: 'Moda Mujer', subgroup: 'Ropa' },
  { id: 'moda-mujer-ropa', label: 'Ropa de mujer', group: 'Moda Mujer', subgroup: 'Ropa' },
  { id: 'moda-mujer-vestidos-fiesta', label: 'Vestidos de fiesta', group: 'Moda Mujer', subgroup: 'Ropa' },
  { id: 'moda-mujer-arriendo-vestidos', label: 'Arriendo vestidos Fiesta', group: 'Moda Mujer', subgroup: 'Ropa' },
  { id: 'moda-mujer-sustentable', label: 'Ropa Sustentable (moda circular)', group: 'Moda Mujer', subgroup: 'Ropa' },
  { id: 'moda-mujer-todo-ropa', label: 'Todo ropa mujer', group: 'Moda Mujer', subgroup: 'Ropa' },
  { id: 'moda-mujer-bikinis', label: 'Bikinis', group: 'Moda Mujer', subgroup: 'Ropa' },
  { id: 'moda-mujer-deportiva', label: 'Ropa deportiva', group: 'Moda Mujer', subgroup: 'Ropa' },
  
  // ========== MODA MUJER - ACCESORIOS ==========
  { id: 'moda-mujer-joyas', label: 'Joyas / bijouterie', group: 'Moda Mujer', subgroup: 'Accesorios' },
  { id: 'moda-mujer-relojes', label: 'Relojes', group: 'Moda Mujer', subgroup: 'Accesorios' },
  { id: 'moda-mujer-panuelos', label: 'Pañuelos', group: 'Moda Mujer', subgroup: 'Accesorios' },
  { id: 'moda-mujer-cinturones', label: 'Cinturones', group: 'Moda Mujer', subgroup: 'Accesorios' },
  { id: 'moda-mujer-todo-accesorios', label: 'Todo Accesorios', group: 'Moda Mujer', subgroup: 'Accesorios' },
  
  // ========== MODA MUJER - ZAPATOS Y CARTERAS ==========
  { id: 'moda-mujer-zapatos', label: 'Zapatos', group: 'Moda Mujer', subgroup: 'Zapatos y Carteras' },
  { id: 'moda-mujer-zapatillas', label: 'Zapatillas', group: 'Moda Mujer', subgroup: 'Zapatos y Carteras' },
  { id: 'moda-mujer-carteras', label: 'Carteras', group: 'Moda Mujer', subgroup: 'Zapatos y Carteras' },
  { id: 'moda-mujer-zapatos-carteras', label: 'Zapatos y Carteras', group: 'Moda Mujer', subgroup: 'Zapatos y Carteras' },
  
  // ========== MODA - COSMÉTICA Y PERFUMERÍA ==========
  { id: 'moda-cosmeticos', label: 'Cosméticos', group: 'Moda Mujer', subgroup: 'Cosmética y perfumería' },
  { id: 'moda-perfumes', label: 'Perfumes', group: 'Moda Mujer', subgroup: 'Cosmética y perfumería' },
  { id: 'moda-skincare', label: 'Skincare', group: 'Moda Mujer', subgroup: 'Cosmética y perfumería' },
  { id: 'moda-todo-cosmeticos', label: 'Todo cosméticos, perfumes y skincare', group: 'Moda Mujer', subgroup: 'Cosmética y perfumería' },
  
  // ========== MODA - ANTEOJOS ==========
  { id: 'moda-anteojos', label: 'Anteojos moda', group: 'Moda Mujer', subgroup: 'Anteojos' },
  
  // ========== MODA HOMBRE ==========
  { id: 'moda-hombre-ropa', label: 'Todo ropa hombre', group: 'Moda Hombre', subgroup: 'Ropa' },
  { id: 'moda-hombre-accesorios', label: 'Todo accesorio hombres', group: 'Moda Hombre', subgroup: 'Accesorios' },
  { id: 'moda-hombre-zapatos', label: 'Todo zapatos y zapatillas hombre', group: 'Moda Hombre', subgroup: 'Zapatos y zapatillas' },
  
  // ========== NEGOCIO - HOGAR Y DECORACIÓN ==========
  { id: 'negocio-menaje', label: 'Menaje', group: 'Negocio', subgroup: 'Artículos de hogar y decoración' },
  { id: 'negocio-ropa-cama', label: 'Ropa de cama', group: 'Negocio', subgroup: 'Artículos de hogar y decoración' },
  { id: 'negocio-decoracion', label: 'Decoración y diseño', group: 'Negocio', subgroup: 'Artículos de hogar y decoración' },
  { id: 'negocio-cocina', label: 'Cocina', group: 'Negocio', subgroup: 'Artículos de hogar y decoración' },
  { id: 'negocio-todo-hogar', label: 'Todo artículos de hogar y decoración', group: 'Negocio', subgroup: 'Artículos de hogar y decoración' },
  
  // ========== NEGOCIO - VARIOS ==========
  { id: 'negocio-deportivos', label: 'Artículos de deporte', group: 'Negocio', subgroup: 'Artículos deportivos' },
  { id: 'negocio-opticos', label: 'Lentes ópticos', group: 'Negocio', subgroup: 'Artículos ópticos' },
  { id: 'negocio-bicicletas', label: 'Venta de bicicletas', group: 'Negocio', subgroup: 'Bicicletas' },
  { id: 'negocio-packaging', label: 'Cajas, bolsas y packaging', group: 'Negocio', subgroup: 'Packaging' },
  { id: 'negocio-facility', label: 'Toallas de papel, papel higiénico, limpieza, vasos', group: 'Negocio', subgroup: 'Insumos oficinas' },
  { id: 'negocio-imprenta', label: 'Impresión y branding', group: 'Negocio', subgroup: 'Imprentas' },
  { id: 'negocio-jugueteria', label: 'Venta de Juguetes', group: 'Negocio', subgroup: 'Juguetería' },
  { id: 'negocio-bebe', label: 'Artículos de bebé', group: 'Negocio', subgroup: 'Artículos de bebé' },
  { id: 'negocio-arregla-celulares', label: 'Arregla celulares', group: 'Negocio', subgroup: 'Tecnología y electrónicos' },
  { id: 'negocio-accesorios-celulares', label: 'Accesorios celulares', group: 'Negocio', subgroup: 'Tecnología y electrónicos' },
  { id: 'negocio-electrodomesticos', label: 'Venta de electrodomésticos', group: 'Negocio', subgroup: 'Tecnología y electrónicos' },
  { id: 'negocio-libreria', label: 'Artículos de librería', group: 'Negocio', subgroup: 'Librería, papelería' },
  { id: 'negocio-libros', label: 'Libros', group: 'Negocio', subgroup: 'Librería, editorial' },
  { id: 'negocio-dulceria', label: 'Dulcería y confitería', group: 'Negocio', subgroup: 'Tienda de dulces' },
  { id: 'negocio-cordoneria', label: 'Cordonería', group: 'Negocio', subgroup: 'Cordonería' },
  { id: 'negocio-muebles', label: 'Muebles', group: 'Negocio', subgroup: 'Mueblería' },
  { id: 'negocio-farmacia', label: 'Farmacia', group: 'Negocio', subgroup: 'Farmacia' },
  { id: 'negocio-videojuegos', label: 'Videojuegos y accesorios gamer', group: 'Negocio', subgroup: 'Video juegos' },
  { id: 'negocio-camaras-seguridad', label: 'Venta de cámaras de seguridad', group: 'Negocio', subgroup: 'Seguridad' },
  { id: 'negocio-aceite-oliva', label: 'Venta aceite de oliva', group: 'Negocio', subgroup: 'Alimentos especializados' },
  { id: 'negocio-te', label: 'Venta de té', group: 'Negocio', subgroup: 'Alimentos especializados' },
  { id: 'negocio-licoreria', label: 'Venta de Alcohol (+18)', group: 'Negocio', subgroup: 'Licorería' },
  { id: 'negocio-minimarket', label: 'Supermercado o minimarket', group: 'Negocio', subgroup: 'Supermercado' },
  { id: 'negocio-comercio-internacional', label: 'Comercio internacional (importación/exportación)', group: 'Negocio', subgroup: 'Comercio internacional' },
  
  // ========== ALIMENTOS Y GASTRONOMÍA ==========
  { id: 'gastro-restaurante', label: 'Restaurante y/o cafetería', group: 'Alimentos y Gastronomía', subgroup: 'Restaurantes' },
  { id: 'gastro-saludable', label: 'Comida y Snacks saludables', group: 'Alimentos y Gastronomía', subgroup: 'Alimentos saludables' },
  { id: 'gastro-delivery', label: 'Comida preparada a domicilio', group: 'Alimentos y Gastronomía', subgroup: 'Delivery' },
  { id: 'gastro-pasteleria', label: 'Tortas y repostería', group: 'Alimentos y Gastronomía', subgroup: 'Pastelería' },
  { id: 'gastro-panaderia', label: 'Panadería', group: 'Alimentos y Gastronomía', subgroup: 'Panadería' },
  { id: 'gastro-catering', label: 'Catering y banquetería', group: 'Alimentos y Gastronomía', subgroup: 'Catering' },
  { id: 'gastro-gourmet', label: 'Productos gourmet', group: 'Alimentos y Gastronomía', subgroup: 'Productos gourmet' },
  { id: 'gastro-mariscos', label: 'Mariscos', group: 'Alimentos y Gastronomía', subgroup: 'Productos congelados' },
  { id: 'gastro-congelados', label: 'Productos congelados', group: 'Alimentos y Gastronomía', subgroup: 'Productos congelados' },
  { id: 'gastro-todo-gourmet', label: 'Todo productos gourmet y congelados', group: 'Alimentos y Gastronomía', subgroup: 'Productos gourmet' },
  { id: 'gastro-verduleria', label: 'Frutas y verduras', group: 'Alimentos y Gastronomía', subgroup: 'Verdulería' },
  { id: 'gastro-bebidas', label: 'Bebidas y jugos', group: 'Alimentos y Gastronomía', subgroup: 'Bebidas' },
  { id: 'gastro-fermentados', label: 'Alimentos fermentados', group: 'Alimentos y Gastronomía', subgroup: 'Fermentados' },
  { id: 'gastro-conservas', label: 'Alimentos en conserva', group: 'Alimentos y Gastronomía', subgroup: 'Conservas' },
  
  // ========== BELLEZA, ESTÉTICA Y BIENESTAR ==========
  { id: 'belleza-peluqueria', label: 'Peluquería y barbería', group: 'Belleza, Estética y Bienestar', subgroup: 'Peluquería' },
  { id: 'belleza-cejas-pestanas', label: 'Cejas y pestañas', group: 'Belleza, Estética y Bienestar', subgroup: 'Cejas / pestañas' },
  { id: 'belleza-manicure', label: 'Manicure y pedicure', group: 'Belleza, Estética y Bienestar', subgroup: 'Manicure/pedicure' },
  { id: 'belleza-depilacion-cera', label: 'Depilación con cera', group: 'Belleza, Estética y Bienestar', subgroup: 'Depilación' },
  { id: 'belleza-todo', label: 'Todo belleza', group: 'Belleza, Estética y Bienestar', subgroup: 'Todo Belleza' },
  { id: 'belleza-centro-estetica', label: 'Centro de estética', group: 'Belleza, Estética y Bienestar', subgroup: 'Centros de estética' },
  { id: 'belleza-depilacion-laser', label: 'Depilación láser', group: 'Belleza, Estética y Bienestar', subgroup: 'Centros de estética' },
  { id: 'belleza-masoterapia', label: 'Masoterapia y masajes reductivos', group: 'Belleza, Estética y Bienestar', subgroup: 'Masoterapia' },
  { id: 'belleza-maquillaje', label: 'Maquilladores', group: 'Belleza, Estética y Bienestar', subgroup: 'Maquillaje' },
  { id: 'belleza-gimnasio', label: 'Gimnasio y centro deportivo', group: 'Belleza, Estética y Bienestar', subgroup: 'Gimnasios' },
  { id: 'belleza-yoga-pilates', label: 'Yoga, Pilates y meditación', group: 'Belleza, Estética y Bienestar', subgroup: 'Mindfulness' },
  { id: 'belleza-reiki', label: 'Reiki y acupuntura', group: 'Belleza, Estética y Bienestar', subgroup: 'Reiki y acupuntura' },
  { id: 'belleza-terapias-alternativas', label: 'Terapias alternativas (reiki, flores de Bach, etc.)', group: 'Belleza, Estética y Bienestar', subgroup: 'Terapias alternativas' },
  { id: 'belleza-nutricionista', label: 'Nutricionista', group: 'Belleza, Estética y Bienestar', subgroup: 'Nutrición' },
  { id: 'belleza-personal-trainer', label: 'Personal Trainers', group: 'Belleza, Estética y Bienestar', subgroup: 'Entrenamiento personal' },
  
  // ========== SERVICIOS PROFESIONALES ==========
  { id: 'profesional-abogados', label: 'Abogados', group: 'Servicios Profesionales', subgroup: 'Abogados' },
  { id: 'profesional-contadores', label: 'Contadores y auditores', group: 'Servicios Profesionales', subgroup: 'Contadores' },
  { id: 'profesional-tributario', label: 'Asesorías Tributarias', group: 'Servicios Profesionales', subgroup: 'Asesorías Tributarias' },
  { id: 'profesional-admin-edificios', label: 'Administración de edificios', group: 'Servicios Profesionales', subgroup: 'Administraciones' },
  { id: 'profesional-arquitectos', label: 'Arquitectura', group: 'Servicios Profesionales', subgroup: 'Arquitectos' },
  { id: 'profesional-psicologo-adulto', label: 'Psicología adulto', group: 'Servicios Profesionales', subgroup: 'Psicólogos' },
  { id: 'profesional-psicologo-infantil', label: 'Psicología infantil', group: 'Servicios Profesionales', subgroup: 'Psicólogos' },
  { id: 'profesional-psicologo-todo', label: 'Todo psicología', group: 'Servicios Profesionales', subgroup: 'Psicólogos' },
  { id: 'profesional-coaching', label: 'Coaching', group: 'Servicios Profesionales', subgroup: 'Coaches' },
  { id: 'profesional-traductores', label: 'Traductores idiomas', group: 'Servicios Profesionales', subgroup: 'Traductores' },
  { id: 'profesional-dentista', label: 'Servicios dentales', group: 'Servicios Profesionales', subgroup: 'Dentistas' },
  { id: 'profesional-estetico', label: 'Servicios estéticos', group: 'Servicios Profesionales', subgroup: 'Estéticos' },
  { id: 'profesional-dentista-estetico', label: 'Todo dentista y estético', group: 'Servicios Profesionales', subgroup: 'Dentistas' },
  { id: 'profesional-enfermeria', label: 'Enfermera-o', group: 'Servicios Profesionales', subgroup: 'Enfermería' },
  { id: 'profesional-adulto-mayor', label: 'Cuidado de adultos mayores', group: 'Servicios Profesionales', subgroup: 'Cuidado adultos mayores' },
  { id: 'profesional-babysitter', label: 'Baby sitter', group: 'Servicios Profesionales', subgroup: 'Cuidado de niños' },
  { id: 'profesional-quiropractico', label: 'Quiropráctico', group: 'Servicios Profesionales', subgroup: 'Quiropraxia' },
  { id: 'profesional-kinesiologo', label: 'Kinesiólogo-a', group: 'Servicios Profesionales', subgroup: 'Kinesiología' },
  { id: 'profesional-fisioterapeuta', label: 'Fisioterapeuta', group: 'Servicios Profesionales', subgroup: 'Fisioterapia' },
  { id: 'profesional-todo-kinesiologia', label: 'Todo Kinesiología', group: 'Servicios Profesionales', subgroup: 'Kinesiología' },
  { id: 'profesional-seguros', label: 'Corredores de seguros', group: 'Servicios Profesionales', subgroup: 'Seguros' },
  { id: 'profesional-propiedades', label: 'Corredores de propiedades', group: 'Servicios Profesionales', subgroup: 'Propiedades' },
  
  // ========== EDUCACIÓN Y CAPACITACIÓN ==========
  { id: 'educacion-clases-particulares', label: 'Clases particulares o reforzamiento escolar', group: 'Educación y Capacitación', subgroup: 'Clases particulares' },
  { id: 'educacion-idiomas', label: 'Cursos de idiomas', group: 'Educación y Capacitación', subgroup: 'Cursos de idiomas' },
  { id: 'educacion-arte', label: 'Clases de arte', group: 'Educación y Capacitación', subgroup: 'Talleres de arte' },
  { id: 'educacion-musica', label: 'Clases de música', group: 'Educación y Capacitación', subgroup: 'Talleres de música' },
  { id: 'educacion-coaching', label: 'Coaching y mentoring', group: 'Educación y Capacitación', subgroup: 'Coaching' },
  { id: 'educacion-financiera', label: 'Educación financiera o empresarial', group: 'Educación y Capacitación', subgroup: 'Educación financiera' },
  { id: 'educacion-plataforma', label: 'Plataforma educativa', group: 'Educación y Capacitación', subgroup: 'Plataforma online' },
  { id: 'educacion-psu', label: 'Servicios de tutoría o preparación PSU', group: 'Educación y Capacitación', subgroup: 'Preparación PSU' },
  
  // ========== ARTE, DISEÑO Y CREATIVIDAD ==========
  { id: 'arte-fotografia', label: 'Fotografía y video', group: 'Arte, Diseño y Creatividad', subgroup: 'Fotografía y video' },
  { id: 'arte-diseno-grafico', label: 'Diseño gráfico y branding', group: 'Arte, Diseño y Creatividad', subgroup: 'Diseño gráfico' },
  { id: 'arte-audiovisual', label: 'Producción audiovisual', group: 'Arte, Diseño y Creatividad', subgroup: 'Producción audiovisual' },
  { id: 'arte-ilustracion', label: 'Ilustración y arte digital', group: 'Arte, Diseño y Creatividad', subgroup: 'Ilustración' },
  { id: 'arte-pintura', label: 'Pintura, cerámica, escultura', group: 'Arte, Diseño y Creatividad', subgroup: 'Pintura' },
  { id: 'arte-impresion', label: 'Servicios de impresión', group: 'Arte, Diseño y Creatividad', subgroup: 'Impresión' },
  { id: 'arte-marketing', label: 'Marketing digital o community management', group: 'Arte, Diseño y Creatividad', subgroup: 'Marketing digital' },
  
  // ========== CONSTRUCCIÓN Y MANTENCIÓN ==========
  { id: 'construccion-remodelacion', label: 'Construcción y remodelación', group: 'Construcción y Mantención', subgroup: 'Construcción' },
  { id: 'construccion-paisajismo', label: 'Paisajista', group: 'Construcción y Mantención', subgroup: 'Paisajismo' },
  { id: 'construccion-piscinas', label: 'Construcción de piscinas', group: 'Construcción y Mantención', subgroup: 'Piscinas' },
  { id: 'construccion-paneles-solares', label: 'Paneles solares', group: 'Construcción y Mantención', subgroup: 'Paneles solares' },
  { id: 'construccion-fumigacion', label: 'Fumigadores', group: 'Construcción y Mantención', subgroup: 'Fumigación' },
  { id: 'construccion-vidrieria', label: 'Paneles ventanas y vidriería', group: 'Construcción y Mantención', subgroup: 'Vidriería' },
  
  // ========== TECNOLOGÍA Y DESARROLLO ==========
  { id: 'tech-software', label: 'Desarrollo de softwares y soluciones tecnológicas', group: 'Tecnología y Desarrollo', subgroup: 'Soluciones tecnológicas' },
  { id: 'tech-hosting', label: 'Hosting y dominios web', group: 'Tecnología y Desarrollo', subgroup: 'Hosting' },
  { id: 'tech-soporte', label: 'Soporte técnico', group: 'Tecnología y Desarrollo', subgroup: 'Soporte técnico' },
  { id: 'tech-automatizacion', label: 'Automatización o robótica', group: 'Tecnología y Desarrollo', subgroup: 'Automatización' },
  { id: 'tech-ia', label: 'Desarrollo IA', group: 'Tecnología y Desarrollo', subgroup: 'Soluciones IA' },
  { id: 'tech-todo-ia', label: 'Todo IA', group: 'Tecnología y Desarrollo', subgroup: 'Todo IA' },
  { id: 'tech-web', label: 'Desarrollo páginas web', group: 'Tecnología y Desarrollo', subgroup: 'E-commerce' },
  { id: 'tech-ciberseguridad', label: 'Ciberseguridad y análisis de datos', group: 'Tecnología y Desarrollo', subgroup: 'Ciberseguridad' },
  
  // ========== TURISMO ==========
  { id: 'turismo-agencia', label: 'Agencia y agente de viajes', group: 'Turismo', subgroup: 'Agencias de viaje' },
  { id: 'turismo-guias', label: 'Guías', group: 'Turismo', subgroup: 'Guías turísticos' },
  { id: 'turismo-hoteleria', label: 'Hotelería', group: 'Turismo', subgroup: 'Hoteles' },
  { id: 'turismo-vinas', label: 'Viñas', group: 'Turismo', subgroup: 'Viñedos' },
  { id: 'turismo-todo', label: 'Todo hoteles y viñas', group: 'Turismo', subgroup: 'Todo' },
  
  // ========== EVENTOS ==========
  { id: 'eventos-centro', label: 'Centro de Eventos', group: 'Eventos', subgroup: 'Arriendo de espacios' },
  { id: 'eventos-matrimonios', label: 'Producción de matrimonios', group: 'Eventos', subgroup: 'Matrimonios' },
  { id: 'eventos-ferias', label: 'Producción para ferias y eventos', group: 'Eventos', subgroup: 'Ferias' },
  { id: 'eventos-todo-produccion', label: 'Todo Producción', group: 'Eventos', subgroup: 'Producción' },
  { id: 'eventos-djs', label: 'DJs', group: 'Eventos', subgroup: 'DJs' },
  { id: 'eventos-foodtruck', label: 'Carros de comida', group: 'Eventos', subgroup: 'Food truck' },
  { id: 'eventos-cumpleanos', label: 'Fiesta de cumpleaños', group: 'Eventos', subgroup: 'Cumpleaños' },
  { id: 'eventos-globos', label: 'Armado de globos', group: 'Eventos', subgroup: 'Globos' },
  { id: 'eventos-animadores', label: 'Animadores', group: 'Eventos', subgroup: 'Animadores' },
  { id: 'eventos-bailarines', label: 'Bailarines', group: 'Eventos', subgroup: 'Bailarines' },
  
  // ========== TRANSPORTE Y LOGÍSTICA ==========
  { id: 'transporte-pasajeros', label: 'Transporte de pasajeros', group: 'Transporte y Logística', subgroup: 'Transporte de pasajeros' },
  { id: 'transporte-furgon-escolar', label: 'Furgón escolar', group: 'Transporte y Logística', subgroup: 'Transporte de pasajeros' },
  { id: 'transporte-mudanzas', label: 'Mudanzas', group: 'Transporte y Logística', subgroup: 'Transporte de carga' },
  { id: 'transporte-delivery', label: 'Delivery para emprendedores', group: 'Transporte y Logística', subgroup: 'Transporte y delivery' },
  { id: 'transporte-rentacar', label: 'Rent a Car', group: 'Transporte y Logística', subgroup: 'Arriendo de vehículos' },
  { id: 'transporte-logistica', label: 'Logística para ecommerce', group: 'Transporte y Logística', subgroup: 'Logística' },
  { id: 'transporte-fletes', label: 'Mudanzas y Fletes', group: 'Transporte y Logística', subgroup: 'Mudanzas y fletes' },
  
  // ========== MASCOTAS Y ANIMALES ==========
  { id: 'mascotas-peluqueria', label: 'Peluquería mascotas', group: 'Mascotas y Animales', subgroup: 'Peluquería canina' },
  { id: 'mascotas-alimento', label: 'Alimento para mascotas', group: 'Mascotas y Animales', subgroup: 'Alimentos' },
  { id: 'mascotas-accesorios', label: 'Accesorios para mascotas', group: 'Mascotas y Animales', subgroup: 'Accesorios' },
  { id: 'mascotas-todo-alimento', label: 'Todo Alimento y accesorios para mascotas', group: 'Mascotas y Animales', subgroup: 'Todo' },
  { id: 'mascotas-paseo', label: 'Paseo y entrenamiento de perros', group: 'Mascotas y Animales', subgroup: 'Paseo' },
  { id: 'mascotas-veterinaria', label: 'Veterinaria', group: 'Mascotas y Animales', subgroup: 'Veterinaria' },
  { id: 'mascotas-cremacion', label: 'Cremación de mascotas', group: 'Mascotas y Animales', subgroup: 'Crematorio' },
  { id: 'mascotas-hotel', label: 'Hoteles de mascotas', group: 'Mascotas y Animales', subgroup: 'Guarderías' },
  
  // ========== INDUSTRIA Y MANUFACTURA ==========
  { id: 'industria-jabones', label: 'Jabones artesanales', group: 'Industria y Manufactura', subgroup: 'Jabones' },
  { id: 'industria-limpieza', label: 'Productos de limpieza hogar', group: 'Industria y Manufactura', subgroup: 'Productos de limpieza' },
  { id: 'industria-envases', label: 'Envases', group: 'Industria y Manufactura', subgroup: 'Producción de envases' },
  { id: 'industria-maquiladores', label: 'Maquiladores', group: 'Industria y Manufactura', subgroup: 'Planta de producción' },
  { id: 'industria-cerveza', label: 'Elaboración de cerveza artesanal', group: 'Industria y Manufactura', subgroup: 'Cerveza artesanal' },
  { id: 'industria-gin', label: 'Elaboración de gin artesanal', group: 'Industria y Manufactura', subgroup: 'Gin artesanal' },
  { id: 'industria-fermentados', label: 'Elaboración alimentos fermentados', group: 'Industria y Manufactura', subgroup: 'Alimentos fermentados' },
  { id: 'industria-bebidas', label: 'Elaboración de bebidas artesanales y fermentados', group: 'Industria y Manufactura', subgroup: 'Bebidas artesanales' },
  
  // ========== OFICIO ==========
  { id: 'oficio-carpintero', label: 'Carpintero', group: 'Oficio', subgroup: 'Carpintería' },
  { id: 'oficio-piscinero', label: 'Piscinero', group: 'Oficio', subgroup: 'Mantención de piscinas' },
  { id: 'oficio-jardinero', label: 'Jardinero', group: 'Oficio', subgroup: 'Jardín' },
  { id: 'oficio-electricista', label: 'Electricista', group: 'Oficio', subgroup: 'Electricidad' },
  { id: 'oficio-limpieza', label: 'Limpieza de casas', group: 'Oficio', subgroup: 'Aseo y mantención' },
  { id: 'oficio-mecanico', label: 'Mecánico', group: 'Oficio', subgroup: 'Taller mecánico' },
  { id: 'oficio-grua', label: 'Servicio de grúa', group: 'Oficio', subgroup: 'Servicios de asistencia' },
  { id: 'oficio-vulcanizacion', label: 'Vulcanización', group: 'Oficio', subgroup: 'Servicios de asistencia' },
  { id: 'oficio-todo-asistencia', label: 'Todo asistencia', group: 'Oficio', subgroup: 'Servicios de asistencia' },
  { id: 'oficio-zapatero', label: 'Zapatero', group: 'Oficio', subgroup: 'Arreglo zapatos y maletas' },
  { id: 'oficio-modista', label: 'Arreglo de ropa', group: 'Oficio', subgroup: 'Modista' },
  
  // ========== OTRO ==========
  { id: 'otro', label: 'Otro', group: 'Otro', subgroup: 'Otro' },
];

// Función helper para obtener categorías por grupo
export const getCategoriesByGroup = (group: CategoryGroup): Category[] => {
  return CATEGORIES.filter(cat => cat.group === group);
};

// Función helper para obtener categorías agrupadas
export const getCategoriesGrouped = (): Record<string, Category[]> => {
  return CATEGORIES.reduce((acc, cat) => {
    const key = `${cat.group} - ${cat.subgroup}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);
};

// Función para buscar categorías
export const searchCategories = (query: string): Category[] => {
  const q = query.toLowerCase();
  return CATEGORIES.filter(cat => 
    cat.label.toLowerCase().includes(q) ||
    cat.group.toLowerCase().includes(q) ||
    cat.subgroup.toLowerCase().includes(q)
  );
};
