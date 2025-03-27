import { Client } from 'pg';

// 异步函数：设置数据库和表
export async function setupDatabase() {
    // 创建初始连接
    const initialClient = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: process.env.POSTGRES_DB || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        port: 5432,
    });

    // 处理初始数据库创建
    try {
        await initialClient.connect();
        console.log('Connected to PostgreSQL');

        // 检查数据库是否存在
        const dbCheck = await initialClient.query(`
      SELECT 1 FROM pg_database WHERE datname = 'contract';
    `);
        if (dbCheck.rowCount === 0) {
            try {
                await initialClient.query('CREATE DATABASE contract');
                console.log('Database "contract" created');
            } catch (createErr) {
                console.error('Error creating database:', createErr);
                throw createErr;
            }
        } else {
            console.log('Database "contract" already exists, skipping creation');
        }
    } catch (err) {
        console.error('Error during initial setup:', err);
        throw err;
    } finally {
        await initialClient.end();
    }

    // 创建目标数据库连接
    const contractClient = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: 'contract',
        password: '',
        port: 5432,
    });

    // 处理表创建
    try {
        await contractClient.connect();
        console.log('Connected to "contract" database');

        // 检查并创建 hunt 表
        const tableHuntCheck = await contractClient.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hunt';
    `);
        if (tableHuntCheck.rowCount === 0) {
            const createTableHunt = `
        CREATE TABLE hunt (
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
            await contractClient.query(createTableHunt);
            console.log('Table "hunt" created');
        } else {
            console.log('Table "hunt" already exists, skipping creation');
        }

        // 检查并创建 buy 表
        const tableBuyCheck = await contractClient.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'buy';
    `);
        if (tableBuyCheck.rowCount === 0) {
            const createTableBuy = `
        CREATE TABLE buy (
          id SERIAL PRIMARY KEY,
          huntId INTEGER NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          address VARCHAR(100) NOT NULL,
          buyAmount INTEGER NOT NULL,
          buyTime INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (huntId) REFERENCES hunt(huntId)
        );

         -- 创建触发器函数
        CREATE OR REPLACE FUNCTION update_hunt_selled()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE hunt
            SET selled = selled + NEW.buyAmount
            WHERE huntId = NEW.huntId;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- 创建触发器
        CREATE TRIGGER trigger_update_selled
        AFTER INSERT ON buy
        FOR EACH ROW
        EXECUTE FUNCTION update_hunt_selled();
      `;
            await contractClient.query(createTableBuy);
            console.log('Table "buy" created');
        } else {
            console.log('Table "buy" already exists, skipping creation');
        }

        // 检查并创建 lotteryDraw 表
        const tableLotteryDrawCheck = await contractClient.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lottery_draw';
    `);
        if (tableLotteryDrawCheck.rowCount === 0) {
            const createTableLotteryDraw = `
        CREATE TABLE lottery_draw (
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
            await contractClient.query(createTableLotteryDraw);
            console.log('Table "lottery_draw" created');
        } else {
            console.log('Table "lottery_draw" already exists, skipping creation');
        }

        // 检查并创建 userClaim 表
        const tableUserClaimCheck = await contractClient.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_claim';
    `);
        if (tableUserClaimCheck.rowCount === 0) {
            const createTableUserClaim = `
        CREATE TABLE user_claim (
          id SERIAL PRIMARY KEY,
          huntId INTEGER NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          claimer VARCHAR(100) NOT NULL,
          claimAmount INTEGER NOT NULL,
          claimTime TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (huntId) REFERENCES hunt(huntId) -- 添加外键约束
        );

        -- 创建触发器函数
        CREATE OR REPLACE FUNCTION update_hunt_selled_on_claim()
        RETURNS TRIGGER AS $$
        BEGIN
            UPDATE hunt
            SET selled = selled - NEW.claimAmount
            WHERE huntId = NEW.huntId;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- 创建触发器
        CREATE TRIGGER trigger_update_selled_on_claim
        AFTER INSERT ON user_claim
        FOR EACH ROW
        EXECUTE FUNCTION update_hunt_selled_on_claim();
      `;
            await contractClient.query(createTableUserClaim);
            console.log('Table "user_claim" created');
        } else {
            console.log('Table "user_claim" already exists, skipping creation');
        }

        // 检查并创建 winnerClaim 表
        const tableWinnerClaimCheck = await contractClient.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'winner_claim';
    `);
        if (tableWinnerClaimCheck.rowCount === 0) {
            const createTableWinnerClaim = `
        CREATE TABLE winner_claim (
          id SERIAL PRIMARY KEY,
          huntId INTEGER UNIQUE NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          claimer VARCHAR(100) NOT NULL,
          claimAmount INTEGER NOT NULL,
          claimTime TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await contractClient.query(createTableWinnerClaim);
            console.log('Table "winner_claim" created');
        } else {
            console.log('Table "winner_claim" already exists, skipping creation');
        }

        // 检查并创建 winnerAbandon 表
        const tableWinnerAbandonCheck = await contractClient.query(`
      SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'winner_abandon';
    `);
        if (tableWinnerAbandonCheck.rowCount === 0) {
            const createTableWinnerAbandon = `
        CREATE TABLE winner_abandon (
          id SERIAL PRIMARY KEY,
          huntId INTEGER UNIQUE NOT NULL,
          txHash VARCHAR(100) UNIQUE NOT NULL,
          winner VARCHAR(100) NOT NULL,
          abandon BOOLEAN DEFAULT TRUE,
          abandonTime TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
            await contractClient.query(createTableWinnerAbandon);
            console.log('Table "winner_abandon" created');
        } else {
            console.log('Table "winner_abandon" already exists, skipping creation');
        }
    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await contractClient.end();
    }
}

export async function addHunt(huntId: bigint, txHash: string, type: bigint, price: bigint, startTime: bigint, endTime: bigint, amount: bigint, selled: bigint) {
    const contractClient = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: 'contract',
        password: '',
        port: 5432,
    });

    // 处理表创建
    try {
        await contractClient.connect();
        console.log('Connected to "contract" database');
        const insertHunt = `
        INSERT INTO hunt (huntId, txHash, type, price, startTime, endTime, amount, selled)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (huntId) DO NOTHING;
      `;
        const huntValues = [huntId, txHash, type, price, startTime, endTime, amount, selled];
        await contractClient.query(insertHunt, huntValues);
        console.log('data inserted into "hunt" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await contractClient.end();
    }
}

export async function addBuy(huntId: bigint, txHash: string, address: string, buyAmount: bigint, timeStamp: bigint) {
    const contractClient = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: 'contract',
        password: '',
        port: 5432,
    });

    // 处理表创建
    try {
        await contractClient.connect();

        //         const exitValues = [
        //             huntId, address, buyAmount, timeStamp
        //         ];
        //         const checkQuery = `
        //     SELECT 1 FROM buy
        //     WHERE huntId = $1 AND address = $2 AND buyAmount = $3 AND buyTime = $4;
        // `;
        //         const checkResult = await contractClient.query(checkQuery, exitValues);

        // if (checkResult.rowCount === 0) {
        const insertBuy = `
        INSERT INTO buy (huntId, txHash, address, buyAmount, buyTime)
        VALUES
          ($1, $2, $3, $4, $5)
        ON CONFLICT (txHash) DO NOTHING;
      `;
        const buyValues = [
            huntId, txHash, address, buyAmount, timeStamp
        ];
        await contractClient.query(insertBuy, buyValues);
        console.log('data inserted into "buy" with huntid:', huntId);
        // }
    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await contractClient.end();
    }
}

export async function addLotteryDraw(huntId: bigint, txHash: string, drawer: string, winner: string, winAmount: bigint, drawTime: bigint) {
    const contractClient = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: 'contract',
        password: '',
        port: 5432,
    });

    // 处理表创建
    try {
        await contractClient.connect();
        console.log('Connected to "contract" database');
        const insertLotteryDraw = `
    INSERT INTO lottery_draw (huntId, txHash, drawer, winner, winAmount, drawTime)
    VALUES
    ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (huntId) DO NOTHING;
    `;
        const lotteryDrawValues = [
            huntId, txHash, drawer, winner, winAmount, drawTime
        ];
        await contractClient.query(insertLotteryDraw, lotteryDrawValues);
        console.log('Sample data inserted into "lottery_draw" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await contractClient.end();
    }


}

export async function addUserClaim(huntId: bigint, txHah: string, claimer: string, claimAmount: bigint, claimTime: bigint) {
    const contractClient = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: 'contract',
        password: '',
        port: 5432,
    });

    // 处理表创建
    try {
        await contractClient.connect();
        console.log('Connected to "contract" database');
        const insertUserClaim = `
        INSERT INTO user_claim (huntId, txHah, claimer, claimAmount, claimTime)
        VALUES
          ($1, $2, $3, $4, $5)
        ON CONFLICT (txHah) DO NOTHING;
      `;
        const userClaimValues = [
            huntId, txHah, claimer, claimAmount, claimTime
        ];
        await contractClient.query(insertUserClaim, userClaimValues);
        console.log('Sample data inserted into "user_claim" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await contractClient.end();
    }
}

export async function addWinnerClaim(huntId: bigint, txHash: string, claimer: string, claimAmount: bigint, claimTime: bigint) {
    const contractClient = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: 'contract',
        password: '',
        port: 5432,
    });

    // 处理表创建
    try {
        await contractClient.connect();
        console.log('Connected to "contract" database');
        const insertWinnerClaim = `
        INSERT INTO winner_claim (huntId, txHash, claimer, claimAmount, claimTime)
        VALUES
          ($1, $2, $3, $4, $5)
        ON CONFLICT (huntId) DO NOTHING;
      `;
        const winnerClaimValues = [
            huntId, txHash, claimer, claimAmount, claimTime
        ];
        await contractClient.query(insertWinnerClaim, winnerClaimValues);
        console.log('Sample data inserted into "winner_claim" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await contractClient.end();
    }
}


export async function addWinnerAbandon(huntId: bigint, txHash: string, winner: string, abandon: boolean, abandonTime: bigint) {
    const contractClient = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: 'contract',
        password: '',
        port: 5432,
    });

    // 处理表创建
    try {
        await contractClient.connect();
        console.log('Connected to "contract" database');
        const insertWinnerAbandon = `
      INSERT INTO winner_abandon (huntId, txHash, winner, abandon, abandonTime)
      VALUES
        ($1, $2, $3, $4, $5)
     ON CONFLICT (huntId) DO NOTHING;
    `;
        const winnerAbandonValues = [
            huntId, txHash, winner, abandon, abandonTime
        ];
        await contractClient.query(insertWinnerAbandon, winnerAbandonValues);
        console.log('Sample data inserted into "winner_abandon" with huntid:', huntId);

    } catch (err) {
        console.error('Error during table setup:', err);
        throw err;
    } finally {
        await contractClient.end();
    }
}

// 执行函数
if (require.main === module) {
    setupDatabase().catch((err) => {
        console.error('Setup failed:', err);
        process.exit(1);
    });
}