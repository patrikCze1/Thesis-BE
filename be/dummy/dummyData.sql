insert into clients (name) values ('Google');

insert into users (roles, username, firstName, lastName, email, password, sex, position) values ('[\"admin\"]','admin', 'Petr', 'Admin', 'admin@jago.cz', '$2b$10$LUKIS8nCMsRb4oKVqa5RR.w3rZUUr7.JZ0rZaXiZOEu0r7F7v6Aku', 'M', 'CEO');
insert into users (roles, username, firstName, lastName, email, password, sex, position,deactivated) values ('[\"user\"]','user1', 'Jana', 'Nováková', 'user1@jago.cz', '$2b$10$LUKIS8nCMsRb4oKVqa5RR.w3rZUUr7.JZ0rZaXiZOEu0r7F7v6Aku', 'F', 'Zaměstnanec',true);
insert into users (roles, username, firstName, lastName, email, password, sex, position, deactivated) values ('[\"user\"]','user2', 'Pert', 'Nový', 'user2@jago.cz', '$2b$10$LUKIS8nCMsRb4oKVqa5RR.w3rZUUr7.JZ0rZaXiZOEu0r7F7v6Aku', 'M', 'Zaměstnanec',true);
insert into users (roles, username, firstName, lastName, email, password, sex, position) values ('[\"user\"]','user3', 'Jan', 'Starý', 'user3@jago.cz', '$2b$10$LUKIS8nCMsRb4oKVqa5RR.w3rZUUr7.JZ0rZaXiZOEu0r7F7v6Aku', 'M', 'Zaměstnanec');
insert into users (roles, username, firstName, lastName, email, password, sex, position) values ('[\"management\"]','management', 'Petra', 'Svobodová', 'mng@jago.cz', '$2b$10$LUKIS8nCMsRb4oKVqa5RR.w3rZUUr7.JZ0rZaXiZOEu0r7F7v6Aku', 'F', 'Manažer');

INSERT INTO `Todos`(`name`,`userId`) VALUES ('1. Přihlas se do aplikace jako administrátor a měřit si čas po dobu testování',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('2. Vytvoř nového uživatele se svými údaji, pozicí tester a rolí uživatel',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('3. Odstraň všechny deaktivované uživatele a deaktivuj účet uživatele Jan Starý',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('4. Svého vytvořeného uživatele přidej do nové skupiny s názvem „testeři“',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('5. Vytvořit klienta se jménem Jago a dvěma tel. čísly a ostatní klienty odtraň',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('6. Přidej nový projekt s názvem „Testování“ a klientem Jago, projekt má být přiřazen skupině testerů a dokončen do konce dubna.',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('7. Vytvoř novou nástěnku s termínem na konec měsíce',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('8. Nástěnce přidej jeden pracovní sloupec s názvem „testování“ a omez počet úkolů na jeden',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('9. Vytvoř dva úkoly a přiřaď je svému uživateli',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('10. Nastav svému uživateli manažerská práva',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('11. Zastav měření času',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('12. Přihlas se pod svým účtem a měř si odpracovaný čas',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('13. Zjisti podrobnosti o přiřazených úkolech',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('14. Prvnímu úkolu přidej dva podúkoly, změň popis, napiš komentář s přílohou o dokončení a úkol dokonči',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('15. Jeden z podúkolů nakonec není potřeba, tak ho odstraň a druhý přesuň do archivu',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('16. Druhému úkolu přidej checklist se dvěma položkami',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('17. V backlogu vytvoř úkol s nejvyšší prioritou a s termínem dnes večer a přiřaď ho do nástěnky',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('18. V nástěnce se pokus tento úkol vyfiltrovat',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('19. Změň si heslo',1);
INSERT INTO `Todos`(`name`,`userId`) VALUES ('20. Ukonči časomíru a zjisti, jak dlouho testování trvalo a záznamy exportuj',1);