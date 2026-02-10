const DatabaseStatements = [

    {
        table: "accounts",
        statement: `CREATE TABLE "accounts" (
            "id" varchar(100) NOT NULL,
            "username" varchar(45),
            "email" varchar(45),
            "password" varchar(100),
            "created_date" varchar(100),
            "email_confirmed" varchar(45),
            "email_confirmed_date" varchar(45),
            PRIMARY KEY ("id")
        );`
    },

    {
        table: "characters",
        statement: `CREATE TABLE "characters" (
            "id" varchar(100) NOT NULL,
            "account_id" varchar(45),
            "data" varchar(45),
            PRIMARY KEY ("id")
        );`
    }


];

export default DatabaseStatements;