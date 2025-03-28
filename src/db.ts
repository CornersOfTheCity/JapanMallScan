import { Pool } from 'pg';

// 创建连接池
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    port: Number(process.env.POSTGRES_PORT || '5432'),
});
// 异步函数：设置数据库和表
export async function setupDatabase() {
    // 处理初始数据库创建
    // try {
    //     await client.connect();
    //     console.log('Connected to PostgreSQL');

    //     // 检查数据库是否存在
    //     const dbCheck = await client.query(`
    //   SELECT 1 FROM pg_database WHERE datname = 'contract';
    // `);
    //     if (dbCheck.rowCount === 0) {
    //         try {
    //             await client.query('CREATE DATABASE contract');
    //             console.log('Database "contract" created');
    //         } catch (createErr) {
    //             console.error('Error creating database:', createErr);
    //             throw createErr;
    //         }
    //     } else {
    //         console.log('Database "contract" already exists, skipping creation');
    //     }
    // } catch (err) {
    //     console.error('Error during initial setup:', err);
    //     throw err;
    // } finally {
    //     await client.end();
    // }

    // 创建目标数据库连接
    // const client = new Client({
    //     user: process.env.POSTGRES_USER || 'postgres',
    //     host: process.env.POSTGRES_HOST || 'localhost',
    //     database: 'contract',
    //     password: '',
    //     port: 5432,
    // });

    // 处理表创建
    let client;
    try {
        client = await pool.connect();
        console.log('Connected to database');


        // 检查并创建 contract_hunt 表
        const tableHuntCheck = await client.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contract_hunt';
    `);
        if (tableHuntCheck.rowCount === 0) {
            const createTableHunt = `
        CREATE TABLE contract_hunt (
          id SERIAL PRIMARY KEY,
          huntId INTEGER UNIQUE NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          type INTEGER NOT NULL,
          price DECIMAL(30) NOT NULL,
          startTime INTEGER NOT NULL,
          endTime INTEGER NOT NULL,
          amount INTEGER NOT NULL,
          selled INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await client.query(createTableHunt);
            console.log('Table "contract_hunt" created');
        } else {
            console.log('Table "contract_hunt" already exists, skipping creation');
        }

        // 检查并创建 contract_buy 表
        const tableBuyCheck = await client.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contract_buy';
    `);
        if (tableBuyCheck.rowCount === 0) {
            const createTableBuy = `
        CREATE TABLE contract_buy (
          id SERIAL PRIMARY KEY,
          huntId INTEGER NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          address VARCHAR(100) NOT NULL,
          buyAmount INTEGER NOT NULL,
          buyTime INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (huntId) REFERENCES contract_hunt(huntId)
        );

         -- 创建触发器函数
        CREATE OR REPLACE FUNCTION update_hunt_selled()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE contract_hunt
            SET selled = selled + NEW.buyAmount
            WHERE huntId = NEW.huntId;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- 创建触发器
        CREATE TRIGGER trigger_update_selled
        AFTER INSERT ON contract_buy
        FOR EACH ROW
        EXECUTE FUNCTION update_hunt_selled();
      `;
            await client.query(createTableBuy);
            console.log('Table "contract_buy" created');
        } else {
            console.log('Table "contract_buy" already exists, skipping creation');
        }

        // 检查并创建 lotteryDraw 表
        const tableLotteryDrawCheck = await client.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contract_lottery_draw';
    `);
        if (tableLotteryDrawCheck.rowCount === 0) {
            const createTableLotteryDraw = `
        CREATE TABLE contract_lottery_draw (
          id SERIAL PRIMARY KEY,
          huntId INTEGER UNIQUE NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          drawer VARCHAR(100) NOT NULL,
          winner VARCHAR(100) NOT NULL,
          winAmount INTEGER NOT NULL,
          drawTime TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await client.query(createTableLotteryDraw);
            console.log('Table "contract_lottery_draw" created');
        } else {
            console.log('Table "contract_lottery_draw" already exists, skipping creation');
        }

        // 检查并创建 userClaim 表
        const tableUserClaimCheck = await client.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contract_user_claim';
    `);
        if (tableUserClaimCheck.rowCount === 0) {
            const createTableUserClaim = `
        CREATE TABLE contract_user_claim (
          id SERIAL PRIMARY KEY,
          huntId INTEGER NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          claimer VARCHAR(100) NOT NULL,
          claimAmount INTEGER NOT NULL,
          claimTime TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (huntId) REFERENCES contract_hunt(huntId) -- 添加外键约束
        );

        -- 创建触发器函数
        CREATE OR REPLACE FUNCTION update_hunt_selled_on_claim()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE contract_hunt
            SET selled = selled - NEW.claimAmount
            WHERE huntId = NEW.huntId;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- 创建触发器
        CREATE TRIGGER trigger_update_selled_on_claim
        AFTER INSERT ON contract_user_claim
        FOR EACH ROW
        EXECUTE FUNCTION update_hunt_selled_on_claim();
      `;
            await client.query(createTableUserClaim);
            console.log('Table "contract_user_claim" created');
        } else {
            console.log('Table "contract_user_claim" already exists, skipping creation');
        }

        // 检查并创建 winnerClaim 表
        const tableWinnerClaimCheck = await client.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contract_winner_claim';
    `);
        if (tableWinnerClaimCheck.rowCount === 0) {
            const createTableWinnerClaim = `
        CREATE TABLE contract_winner_claim (
          id SERIAL PRIMARY KEY,
          huntId INTEGER UNIQUE NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          claimer VARCHAR(100) NOT NULL,
          claimAmount INTEGER NOT NULL,
          claimTime TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await client.query(createTableWinnerClaim);
            console.log('Table "contract_winner_claim" created');
        } else {
            console.log('Table "contract_winner_claim" already exists, skipping creation');
        }

        // 检查并创建 winnerAbandon 表
        const tableWinnerAbandonCheck = await client.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contract_winner_abandon';
    `);
        if (tableWinnerAbandonCheck.rowCount === 0) {
            const createTableWinnerAbandon = `
        CREATE TABLE contract_winner_abandon (
          id SERIAL PRIMARY KEY,
          huntId INTEGER UNIQUE NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          winner VARCHAR(100) NOT NULL,
          abandon BOOLEAN DEFAULT TRUE,
          abandonTime TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await client.query(createTableWinnerAbandon);
            console.log('Table "contract_winner_abandon" created');
        } else {
            console.log('Table "contract_winner_abandon" already exists, skipping creation');
        }

    }
    catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        client?.release();
    }
}

export async function addHunt(huntId: bigint, txHash: string, type: bigint, price: bigint, startTime: bigint, endTime: bigint, amount: bigint, selled: bigint) {
    let client;
    // 处理表创建
    try {
        client = await pool.connect();
        const insertHunt = `
        INSERT INTO contract_hunt (huntId, txHash, type, price, startTime, endTime, amount, selled)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (huntId) DO NOTHING;
      `;
        const huntValues = [huntId, txHash, type, price, startTime, endTime, amount, selled];
        await client.query(insertHunt, huntValues);
        console.log('data inserted into "contract_hunt" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        // 释放客户端回连接池
        await client?.release();
    }
}

export async function addBuy(huntId: bigint, txHash: string, address: string, buyAmount: bigint, timeStamp: bigint) {
    let client;
    // 处理表创建
    try {
        client = await pool.connect();

        //         const exitValues = [
        //             huntId, address, buyAmount, timeStamp
        //         ];
        //         const checkQuery = `
        //     SELECT 1 FROM contract_buy
        //     WHERE huntId = $1 AND address = $2 AND buyAmount = $3 AND buyTime = $4;
        // `;
        //         const checkResult = await client.query(checkQuery, exitValues);

        // if (checkResult.rowCount === 0) {
        const insertBuy = `
        INSERT INTO contract_buy (huntId, txHash, address, buyAmount, buyTime)
        VALUES
          ($1, $2, $3, $4, $5)
        ON CONFLICT (txHash) DO NOTHING;
      `;
        const buyValues = [
            huntId, txHash, address, buyAmount, timeStamp
        ];
        await client.query(insertBuy, buyValues);
        console.log('data inserted into "contract_buy" with huntid:', huntId);
        // }
    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await client?.release();
    }
}

export async function addLotteryDraw(huntId: bigint, txHash: string, drawer: string, winner: string, winAmount: bigint, drawTime: bigint) {
    let client;
    // 处理表创建
    try {
        client = await pool.connect();
        const insertLotteryDraw = `
    INSERT INTO contract_lottery_draw (huntId, txHash, drawer, winner, winAmount, drawTime)
    VALUES
    ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (huntId) DO NOTHING;
    `;
        const lotteryDrawValues = [
            huntId, txHash, drawer, winner, winAmount, drawTime
        ];
        await client.query(insertLotteryDraw, lotteryDrawValues);
        console.log('Sample data inserted into "contract_lottery_draw" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await client?.release();
    }


}

export async function addUserClaim(huntId: bigint, txHah: string, claimer: string, claimAmount: bigint, claimTime: bigint) {
    let client;
    // 处理表创建
    try {
        client = await pool.connect();
        const insertUserClaim = `
        INSERT INTO contract_user_claim (huntId, txHah, claimer, claimAmount, claimTime)
        VALUES
          ($1, $2, $3, $4, $5)
        ON CONFLICT (txHah) DO NOTHING;
      `;
        const userClaimValues = [
            huntId, txHah, claimer, claimAmount, claimTime
        ];
        await client.query(insertUserClaim, userClaimValues);
        console.log('Sample data inserted into "contract_user_claim" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await client?.release();
    }
}

export async function addWinnerClaim(huntId: bigint, txHash: string, claimer: string, claimAmount: bigint, claimTime: bigint) {
    let client;
    // 处理表创建
    try {
        client = await pool.connect();
        const insertWinnerClaim = `
        INSERT INTO contract_user_claim (huntId, txHash, claimer, claimAmount, claimTime)
        VALUES
          ($1, $2, $3, $4, $5)
        ON CONFLICT (huntId) DO NOTHING;
      `;
        const winnerClaimValues = [
            huntId, txHash, claimer, claimAmount, claimTime
        ];
        await client.query(insertWinnerClaim, winnerClaimValues);
        console.log('Sample data inserted into "contract_user_claim" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        client?.release();
    }
}


export async function addWinnerAbandon(huntId: bigint, txHash: string, winner: string, abandon: boolean, abandonTime: bigint) {
    let client;
    // 处理表创建
    try {
        client = await pool.connect();
        const insertWinnerAbandon = `
      INSERT INTO contract_winner_abandon (huntId, txHash, winner, abandon, abandonTime)
      VALUES
        ($1, $2, $3, $4, $5)
     ON CONFLICT (huntId) DO NOTHING;
    `;
        const winnerAbandonValues = [
            huntId, txHash, winner, abandon, abandonTime
        ];
        await client.query(insertWinnerAbandon, winnerAbandonValues);
        console.log('Sample data inserted into "contract_winner_abandon" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        client?.release();
    }
}

// 关闭连接池（在应用退出时调用）
process.on('exit', async () => {
    await pool.end();
    console.log('Pool closed');
});

// 执行函数
if (require.main === module) {
    setupDatabase().catch((err) => {
        console.error('Setup failed:', err);
        process.exit(1);
    });
}