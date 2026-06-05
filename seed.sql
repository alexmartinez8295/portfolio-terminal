PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO _prisma_migrations VALUES('2d2475df-3f4a-45d2-949b-364e5db00afa','a4a43c061de086c671c793b025140fa06f430026408dbf96b63efb75f5c83f5c',1776287338800,'20260415210858_init',NULL,NULL,1776287338789,1);
INSERT INTO _prisma_migrations VALUES('de8d493b-2b4c-4d5f-9f74-ebc40489487b','a4f5813c1cdcee7be25b986adb51713d75e30daf099be6ee5e3307f3d894415c',1776288835070,'20260415213355_blog',NULL,NULL,1776288835055,1);
INSERT INTO _prisma_migrations VALUES('60b7e1a5-f83a-4d94-a091-4449145a1cc7','fdfa448e36ef34e82327b8c47292502cf1b23f075286787b1ad5cc7e8e6d4cf2',1776291895454,'20260415222455_contact',NULL,NULL,1776291895443,1);
INSERT INTO _prisma_migrations VALUES('7fe2b93e-2868-40c7-82e6-44ec9ef872e5','85f2f5db58cf47182cad943592a9156bdb86d43435980d6a49c12959b8cc7242',1776292402267,'20260415223322_add_read_contact',NULL,NULL,1776292402244,1);
INSERT INTO _prisma_migrations VALUES('03aa73d9-d98b-45c0-a918-93796b70bb41','c69a0d698a5ac43f004c49086b44e137716733c3051573c67b986130873c918f',1776293433034,'20260415225033_add_profile',NULL,NULL,1776293433023,1);
INSERT INTO _prisma_migrations VALUES('9d361a85-cdb3-4ca8-b78c-a4749a858c02','88fb34400b55464c0f2d76816b7af5b69d1914e626bcde7f68e9fe07933b6ead',1776296132015,'20260415233532_add_profile_image',NULL,NULL,1776296132004,1);
INSERT INTO _prisma_migrations VALUES('51097215-6b70-4848-bbf2-699afe35f7ac','e47117dc7e988938bb6478c8dede8fbe27d0ec082e4fae194dee3d755d521733',1776298580362,'20260416001620_add_home_sections',NULL,NULL,1776298580350,1);
INSERT INTO _prisma_migrations VALUES('9f5cf6fd-97c7-47eb-a2a9-5184b91aefc2','46dd7eca60714c74c12fc2d14de035e3f7354123878d09d7c7d02811198968a5',1776299155634,'20260416002555_add_section_alignment',NULL,NULL,1776299155612,1);
CREATE TABLE IF NOT EXISTS "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tech" TEXT NOT NULL,
    "image" TEXT
);
INSERT INTO Project VALUES(1,'Salesforce','Más de 5 años desarrollando en Salesforce','Apex, Visualforce, LWC','/uploads/1776328254276-salesforce_codey.png');
INSERT INTO Project VALUES(2,'Desarrollo WEB','Creación de sitios, aplicaciones web, landing pages','React, Javascript, HTML, CSS','/uploads/1776327962468-desarrollo-web.png');
INSERT INTO Project VALUES(3,'Integraciones','Establecer conexiones entre sistemas...','Java, PHP, SQL','/uploads/1776327786371-integraciones_informaticas.png');
INSERT INTO Project VALUES(4,'Tienda en línea','Actualmente trabajando en una solución para negocios chicos y medianos...','React, MyQSL, Vue, Javascript','/uploads/1776328456841-tienda_online.png');
CREATE TABLE IF NOT EXISTS "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO Post VALUES(1,'Unforgiven','jajaja',1776289889450);
INSERT INTO Post VALUES(2,'Primer post','<p>Espero que este sea el inicio de algo grande...!😎</p>',1776326212470);
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "about" TEXT NOT NULL
, "image" TEXT);
INSERT INTO Profile VALUES(1,'Alx Dev','🤓 Ingeniero de software 💻','Soy un entusiasta de la tecnología con un fuerte interés en el desarrollo de software y la ciberseguridad. Disfruto crear soluciones digitales, aprender nuevas herramientas y enfrentar desafíos que me permitan mejorar continuamente. Me apasiona entender cómo funcionan los sistemas tanto a nivel de desarrollo como de seguridad, buscando siempre construir aplicaciones eficientes, seguras y con impacto real.','/uploads/1776297843976-39ca23b0b67aa5d67ee625a6ef1c6d0a.jpg');
CREATE TABLE IF NOT EXISTS "HomeSection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "alignment" TEXT NOT NULL DEFAULT 'left'
);
INSERT INTO HomeSection VALUES(5,'Linux',unistr('# Mis distros favoritas son:\u000a* Arch\u000a* Fedora\u000a* Kali\u000a* CachyOs\u000a* Debian'),'/uploads/1776329472447-linux_logo.png','',0,'center');
INSERT INTO HomeSection VALUES(6,'Certificaciones',unistr('# Actuamlente tengo las certificaciones de:\u000a- [x] Platform Developer 1\u000a- [x] AI Assocoated\u000a\u000a## *Vamos por más...*'),'/uploads/1776329780961-salesforce_logo.png','',1,'center');
INSERT INTO HomeSection VALUES(7,'Ciberseguridad','Entusiasta siempre por aprender cómo funcionan y cómo defenderse de los ataques informáticos','/uploads/1776329889104-kali_logo.png','',2,'center');
INSERT INTO HomeSection VALUES(8,'Música',unistr('# La guitarra\u000a## Uno de mis pasatiempos favoritos, listo para echar palomazo 🤘...'),'/uploads/1776331846076-guitarra.png','',3,'center');
INSERT INTO HomeSection VALUES(9,'Idiomas',unistr('# Aprender sobre otros países me es placentero, la lista al día de hoy en Duolingo es:\u000a- [x] Inglés\u000a- [ ] Alemán\u000a- [ ] Japones\u000a- [ ] Ruso\u000a- [ ] Portugués'),'/uploads/1776332074424-aprender_idiomas.png','',4,'center');
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('Project',4);
INSERT INTO sqlite_sequence VALUES('Post',2);
INSERT INTO sqlite_sequence VALUES('ContactMessage',1);
INSERT INTO sqlite_sequence VALUES('Profile',1);
INSERT INTO sqlite_sequence VALUES('HomeSection',9);
PRAGMA writable_schema=OFF;
COMMIT;
