const DatabaseStatements = [

    {
        table: "accounts",
        statement: `CREATE TABLE "accounts" (
            "id" varchar(100) NOT NULL,
            "username" varchar(45),
            "email" varchar(45),
            "password" varchar(100),
            "created_date" varchar(100)
            PRIMARY KEY ("id")
        );`
    },

    {
        table: "characters",
        statement: `CREATE TABLE "characters" (
            "id" varchar(100) NOT NULL,
            "account_id" varchar(45),
            "data" varchar(45),
            "name" varchar(50),
            PRIMARY KEY ("id")
        );`
    }


];

export default DatabaseStatements;