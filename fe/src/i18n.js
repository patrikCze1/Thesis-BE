import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      en: {
        translation: {
          "Welcome to React": "Welcome to React and react-i18next",
        },
      },
      cs: {
        translation: {
          "All Projects": "Všechny projekty",
          Projects: "Projekty",
          Add: "Přidat",
          Edit: "Upravit",
          "New project": "Nový projekt",
          Administration: "Administrace",
          Create: "Vytvořit",
          Client: "Klient",
          Clients: "Klienti",
          "client.name": "Jméno",
          "client.weburl": "Web",
          "client.phone": "Telefon",
          "client.email": "E-mail",
          "project.name": "Název",
          "Assign group": "Přiřadit skupinu",
          "Assign employee": "Přiřadit zaměstnance",
          Login: "Přihlásit se",
          "Forgot password": "Zapomenuté heslo",
          "Invalid credentials": "Neplatné přihlašovací údaje",
          Logout: "Odhlásit se",
          Notifications: "Oznámení",
          Name: "Název",
          Phone: "Telefon",
          Email: "E-mail",
          Edit: "Upravit",
          Website: "Web",
          Action: "Akce",
          Detail: "Detail",
          "Delete client": "Odstranit klienta",
          "Client will be deleted": "Klient {{client}} bude odstraněn",
          Delete: "Odstranit",
          delete: "Odstranit",
          Cancel: "Zrušit",
          cancel: "Zrušit",
          remove: "Odstranit",
          Back: "Zpět",
          "Client updated": "Klient upraven",
          "Client deleted": "Klient odstraněn",
          "Client created": "Klient vytvořen",
          "Project created": "Projekt vytvořen",
          "Project updated": "Projekt upraven",
          "Project deleted": "Projekt odstraněn",
          Description: "Popis",
          "Edit project": "Upravit projekt",
          "User created": "Uživatel vytvořen",
          "User updated": "Uživatel upraven",
          "Assigned users": "Přiřazení uživatelé",
          "New task": "Nový úkol",
          Title: "Název",
          Deadline: "Termín dokončení",
          Stage: "Fáze",
          Priority: "Priorita",
          Comments: "Komentáře",
          "This field is required": "Toto pole je povinné.",
          "priority.low": "Nízká",
          "priority.medium": "Střední",
          "priority.high": "Vysoká",
          "priority.critical": "Kritická",
          "priority.urgent": "Urgentní",
          Unassigned: "Nepřiřazeno",
          Creator: "Zadavatel",
          Solver: "Řešitel",
          "Last name": "Příjmení",
          "First name": "Jméno",
          Position: "Pozice",
          "Created at": "Vytvořen",
          Action: "Akce",
          Users: "Uživatelé",
          Save: "Save",
          Username: "Uživatelské jméno",
          Role: "Role",
          User: "Uživatel",
          Admin: "Administrátor",
          Gendre: "Pohlavý",
          Save: "Uložit",
          Password: "Heslo",
          Search: "Vyhledat",
          Groups: "Skupiny",
          "Group edited": "Skupina upravena",
          "Group created": "Skupina vytvořena",
          "Group deleted": "Skupina odstraněna",
          "Users of group": "Uživatelé skupiny",
          Profile: "Profil",
          Settings: "Nastavení",
          "Password again": "Heslo znovu",
          "Change password": "Změna hesla",
          Change: "Změnit",
          "Passwords do not match": "Hesla se neshodují",
          "Password changed": "Heslo změněno",
          "Access denied": "Přístup zamítnut",
          "You do not have acceess to this section":
            "Do této sekce nemáte přístup",
          "Back to homepage": "Zpět na hlavní stránku",
          Choose: "Vyberte",
          "Set checklist": "Zadejte checklist",
          "Edit changes": "Upravit změny",
          "New phase": "Nová fáze",
          "Stage settings": "Nastavení fází",
          "Search results": "Výsledky vyhledávání",
          "Search Result For": "Hledaný výraz",
          "Can not login": "Nelze se přihlásit",
          State: "Stav",
          Tasks: "Úkoly",
          "Newest notifications": "Nejnovější oznámení",
          "View all notifications": "Zobrazit všechny oznámení",
          goBack: "Jít zpět",
          yourEmail: "Váš e-mail",
          send: "Odeslat",
          password: "Heslo",
          passwordAgain: "Heslo znovu",
          add: "Přidat",
          "All rights reserved": "Všechna práva vyhrazena",
          delete: "Smazat",
          auth: {
            forgottenPassword: "Zapomenuté heslo",
            emailSent: "E-mail byl odeslán",
            resetPassword: "Obnovit heslo",
            passwordsNotEqual: "Hesla nejsou stejná",
            passwordChanged: "Heslo změněno",
          },
          menu: {
            timeTracks: "Záznam času",
            report: "Reporty",
            tracking: "Měření",
            myTodos: "Moje Todo",
            tasks: "Úkoly",
          },
          track: {
            whatAreYouDoing: "Na čem pracujete...",
            workedHours: "Odpracované hodiny",
            chooseDate: "Zadejte datum",
            selectProject: "Vyberte projekt",
            selectUser: "Vyberte uživatele",
            hours: "Hodin",
            date: "Datum",
            total: "Celkem",
            selectDate: "Vyberte datum",
            edited: "Záznam upraven",
            created: "Záznam přidán",
            deleted: "Záznam odstraněn",
            showFilters: "Zobrazit filtry",
            records: "Záznamy",
            noRecords: "Žádné záznamy",
            loadOlder: "Načíst starší",
            recordsOfThisWeek: "Záznamy tento týden",
            workingRecords: "Pracovní záznamy",
            withoutProject: "Bez projektu",
            timesByProject: "Časy podle projektu",
          },
          todo: {
            name: "Název",
          },
          label: {
            showAll: "Zobrazit vše",
            noRecords: "Žádné záznamy",
            name: "Název",
            title: "Název",
            save: "Uložit",
            cancel: "Zrušit",
            search: "Hledat",
            create: "Vytvořit",
            actions: "Akce",
            complete: "Dokončit",
            delete: "Odstranit",
            download: "Stáhnout",
            settings: "Nastavení",
            add: "Přidat",
            files: "Soubory",
            upload: "Nahrát",
            hide: "Skrýt",
            change: "Změnit",
            color: "Barva",
            filter: "Filtr",
          },
          task: {
            myTasks: "Moje úkoly",
            state: "Stav",
            deadline: "Termín",
            priority: "Priorita",
            delete: "Odstranit",
            completeTask: "Dokončit úkol",
            unCompleteTask: "Změnit stav na nedokončeno",
            deleteTask: "Odstranit úkol",
            taskWillBeDeleted:
              "Úkol bude ostraněn a nebude možné se k němu vrátit",
            taskCompleted: "Úkol dokončen",
            taskDeleted: "Úkol odstraněn",
            description: "Popis",
            uploadFiles: "Nahrát soubory",
            dragFiles: "Přetáhněte soubory",
            files: "Soubory",
          },
          project: {
            projectWillBeDeleted: "Projekt {{project}} bude odstraněn",
            deleteProject: "Odstranit projekt",
            stageAdded: "Fáze přidána",
            changesSaved: "Změny uloženy",
            stageRemoved: "Fáze odstraněna",
            addPhase: "Přidat fázi",
            title: "Projekt",
            key: "Zkratka",
            creator: "Zadavetel",
            state: {
              active: "Aktivní",
              planned: "Plánovaný",
              completed: "Dokončený",
              cancelled: "Zrušený",
            },
            description: "Popis",
          },
          pagiantion: {
            previous: "Předchozí",
            next: "Další",
          },
          user: {
            deleteUser: "Odstranit uživatele",
            userWillBeDeleted: "Uživatel bude odstraněn",
            usernameInfo: "Slouží k přihlášení",
            role: "Role",
            groups: "Skupiny uživatele",
            userHasNotGroups: "Uživatel nemá žádné skupiny",
          },
          notification: {
            readAll: "Přečíst vše",
          },
          role: {
            user: "Uživatel",
            management: "Manažer",
            admin: "Administrátor",
          },
          sex: {
            male: "Muž",
            female: "Žena",
          },
          group: {
            createdAt: "Vytvořena",
            groupWillBeDeleted: "Skupina bude odstraněna",
            deleteGroup: "Odstranit skupinu",
          },
          dashboard: {
            title: "Úvod",
          },
          comment: {
            deleteComment: "Odstranit komentář",
            commentDeleted: "Komentář odstraněn",
            add: "Přidat komentář",
            addFiles: "Přidat soubory",
            files: "Soubory",
          },
          form: {
            password: "Heslo",
            filesUploaded: "Soubory nahrány",
            fileDeleted: "Soubor odstraněn",
          },
          date: {
            today: "Dnes",
            thisWeek: "Tento týden",
          },
          filter: {
            deadline: "Termín",
            afterDeadline: "Po termínu",
            deadlineIn24Hours: "Během 24 hodin",
            members: "Členové",
            myTasks: "Moje úkoly",
            tasksWithoutUser: "Nezařazené",
            clearFilter: "Smazat filtr",
            taskQuery: "Vyhledejte dle názvu nebo čísla...",
          },
        },
      },
    },
    lng: "cs", // if you're using a language detector, do not define the lng option
    fallbackLng: "cs",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
