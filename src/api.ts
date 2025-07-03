import express, { Request, Response } from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";
import { validatePassword } from "./validatePassword";

const app = express();
app.use(express.json());

// const accounts: any = [];
const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

function isValidName (name: string) {
    return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isValidEmail (email: string) {
    return email.match(/^(.+)\@(.+)$/);
}



app.post("/signup", async (req: Request, res: Response) => {
    const input = req.body;
    if (!isValidName(input.name)) {
        return res.status(422).json({
            error: "Invalid name"
        });
    }
    if (!isValidEmail(input.email)) {
        return res.status(422).json({
            error: "Invalid email"
        });
    }
    if (!validateCpf(input.document)) {
        return res.status(422).json({
            error: "Invalid document"
        });
    }
    if (!validatePassword(input.password)) {
        return res.status(422).json({
            error: "Invalid password"
        });
    }
    const accountId = crypto.randomUUID();
    const account = {
        accountId,
        name: input.name,
        email: input.email,
        document: input.document,
        password: input.password
    }
    // accounts.push(account);
    await connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [account.accountId, account.name, account.email, account.document, account.password]);
    res.json({
        accountId
    });
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId;
    // const account = accounts.find((account: any) => account.accountId === accountId);
    const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
    res.json(accountData);
});

app.post("/deposit", async (req: Request, res: Response) => {
    const input = req.body;
    if(!input.quantity || input.quantity <= 0) {
        return res.status(422).json({
            error: "Invalid quantity"
        });
    }
    if(!input.assetId || (input.assetId !== "BTC" && input.assetId !== "USD")) {
        return res.status(422).json({
            error: "Invalid assetId"
        });
    }
    const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [input.accountId]);
    if(!accountData) {
        return res.status(422).json({
            error: "Account does not exist"
    });
    }
    if(input.assetId === "BTC") {
        await connection.query("update ccca.account set btc_quantity = btc_quantity + $1 where account_id = $2", [input.quantity, input.accountId]);
    } else {
        await connection.query("update ccca.account set usd_quantity = usd_quantity + $1 where account_id = $2", [input.quantity, input.accountId]);
    }
    return res.status(201).end();
});


app.post("/withdraw", async (req: Request, res: Response) => {

    const input = req.body;
    const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [input.accountId]);
    if(!accountData) {
        return res.status(422).json({
            error: "Account does not exist"
    });
}

    if(!input.quantity || input.quantity > accountData.quantity) {
        return res.status(422).json({
            error: "Invalid quantity"
        });
    }

    if(!input.assetId || (input.assetId !== "BTC" && input.assetId !== "USD")) {
        return res.status(422).json({
            error: "Invalid assetId"
        });
    }

    if(input.assetId === "BTC") {
        await connection.query("update ccca.account set btc_quantity = btc_quantity - $1 where account_id = $2", [input.quantity, input.accountId]);
    } else {
        await connection.query("update ccca.account set usd_quantity = usd_quantity - $1 where account_id = $2", [input.quantity, input.accountId]);
    }

    return res.status(201).end();
});




app.listen(3000);