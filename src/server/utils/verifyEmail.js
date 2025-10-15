import fetch from 'node-fetch';

export const verifyEmail = async (email) => {
  const apiKey = process.env.KICKBOX_API_KEY;
  const url = `https://api.kickbox.com/v2/verify?email=${email}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // You can log or inspect the full response
    console.log(data);

    return data.result === 'deliverable';
  } catch (err) {
    console.error('Kickbox verification failed:', err);
    return false; // fallback to safe default
  }
};