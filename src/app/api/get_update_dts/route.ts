import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import {
  maxRequests,
  ipRequests,
  cleanupOldRequests,
  getIP
} from '../../../lib/limiter';


export async function GET () {
  const ip:string = getIP();

  if (!ipRequests[ip as keyof typeof ipRequests])
    ipRequests[ip as keyof typeof ipRequests] = [];

  ipRequests[ip as keyof typeof ipRequests] = cleanupOldRequests(ipRequests[ip as keyof typeof ipRequests]);

  if (ipRequests[ip as keyof typeof ipRequests].length >= maxRequests)
    return NextResponse.json({
      status: 'Rate limit exceeded!'
    }, { status: 429 });

  ipRequests[ip as keyof typeof ipRequests].push(Date.now());

  try {
    const db = await pool.getConnection();
  
    const query = `SELECT
      DATE_FORMAT(update_date, '%Y-%m-%d %T') as update_date,
      MAX(updated_by) updated_by
    FROM ${process.env.TARGET_TABLE}
    WHERE update_date IS NOT NULL
    GROUP BY update_date
    ORDER BY update_date DESC`;

    const [rows] = await db.execute(query);
    db.release();
    
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({
      error: error
    }, { status: 500 });
  }
}
