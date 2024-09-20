import { NextResponse, NextRequest } from 'next/server';
import pool from '../../../lib/db';
import { BaseRecord } from '@/app/context/store';
import { RowDataPacket } from 'mysql2/promise';
import {
  maxRequests,
  ipRequests,
  cleanupOldRequests,
  getIP
} from '../../../lib/limiter';


interface DataType {
  username: string
  data: BaseRecord[]
}

interface UpdateDateTypes extends RowDataPacket {
  update_date: Date
}

const trimData = async () => {
  /*** ENSURES THAT WE DON'T HAVE TOO MUCH DATA IN THE DATABASE ***/
  const query = `SELECT DISTINCT DATE_FORMAT(update_date, '%Y-%m-%d %T') as update_date FROM ${process.env.TARGET_TABLE} WHERE update_date <> '2022-01-11 00:00:00'`;
  const db = await pool.getConnection();
  const [rows] = await db.execute<UpdateDateTypes[]>(query);
  const rowsLength:number = rows.length;

  if (rowsLength < 10) return;

  const updateDatesDel = rows.splice(0,rowsLength-10).map((d:UpdateDateTypes) => d.update_date);
  const updateDateFilter = `("${updateDatesDel.join('","')}")`
  const res = await db.query(`DELETE FROM ${process.env.TARGET_TABLE} WHERE update_date IN ${updateDateFilter}`);
  console.log(res);
  db.release();
}


export async function POST (req:NextRequest) {
  const ip:string = getIP();

  if (!ipRequests[ip as keyof typeof ipRequests])
    ipRequests[ip as keyof typeof ipRequests] = [];

  ipRequests[ip as keyof typeof ipRequests] = cleanupOldRequests(ipRequests[ip as keyof typeof ipRequests]);

  if (ipRequests[ip as keyof typeof ipRequests].length >= maxRequests)
    return NextResponse.json({
      status: 'Rate limit exceeded!'
    }, { status: 429 });

  ipRequests[ip as keyof typeof ipRequests].push(Date.now());

  trimData();

  const data:DataType = await req.json();
  
  try {
    const db = await pool.getConnection();
    const values = data.data.map((d) => [d.Author, d['Review Date'].toString().split('T')[0], d.Address, d.Bank, d.Rating, d['Review Title By User'], d.Review, d['Rating Title By User'], d['Useful Count'], data.username, d.guid, new Date().toISOString().replace('T', ' ').split('.')[0]]);
    const query = db.format(
      `INSERT INTO ${process.env.TARGET_TABLE} (author, review_date, address, bank, rating, review_title_by_user, review, rating_title_by_user, useful_count, updated_by, guid, update_date) VALUES ?`,
      [values]
    );
    const [rows] = await db.execute(query);
    console.log(rows)
    db.release();

    return NextResponse.json({
      status: 'success'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      result: error
    }, { status: 500 });
  }
}
