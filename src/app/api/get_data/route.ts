import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../lib/db';
import {
  maxRequests,
  ipRequests,
  cleanupOldRequests,
  getIP
} from '../../../lib/limiter';


export async function GET (req:NextRequest) {
  const ip:string = getIP();

  if (!ipRequests[ip as keyof typeof ipRequests])
    ipRequests[ip as keyof typeof ipRequests] = [];

  ipRequests[ip as keyof typeof ipRequests] = cleanupOldRequests(ipRequests[ip as keyof typeof ipRequests]);

  if (ipRequests[ip as keyof typeof ipRequests].length >= maxRequests)
    return NextResponse.json({
      status: 'Rate limit exceeded!'
    }, { status: 429 });

  ipRequests[ip as keyof typeof ipRequests].push(Date.now());

  const updateDate = req.nextUrl.searchParams.get('updateDate');

  if (!updateDate)
    return NextResponse.json({ error: 'Missing valid query params' }, { status: 400 });
  
  try {
    const db = await pool.getConnection();
    const query = `SELECT
        guid as id,
        author as Author,
        DATE_FORMAT(review_date, '%Y-%m-%d') 'Review Date',
        address as Address,
        bank as Bank,
        rating as Rating,
        review_title_by_user as 'Review Title By User',
        review as Review,
        rating_title_by_user as 'Rating Title By User',
        useful_count as 'Useful Count',
        updated_by as 'Updated By',
        guid,
        update_date as 'Update Date'
      FROM ${process.env.TARGET_TABLE}
      WHERE update_date = '${updateDate.replace('T', ' ').split('.')[0]}'
      ORDER BY useful_count`;
    
    const [rows] = await db.execute(query);
    // const data = [...rows].forEach((d) => d['Review Date'] = new Date(d['Review Date']))
    db.release();
    
    return NextResponse.json(rows)
  } catch (error) {
    return NextResponse.json({
      error: error
    }, { status: 500 })
  }
}
