exports.handler = async (event) => {
  const JIRA_BASE = 'https://gonopticsdev.atlassian.net';
  const auth = event.headers['authorization'] || event.headers['Authorization'] || '';
  const path = event.queryStringParameters?.path || '';

  const params = { ...event.queryStringParameters };
  delete params.path;
  const qs = new URLSearchParams(params).toString();
  const url = `${JIRA_BASE}${path}${qs ? '?' + qs : ''}`;

  try {
    const res = await fetch(url, {
      method: event.httpMethod === 'OPTIONS' ? 'GET' : event.httpMethod,
      headers: {
        'Authorization': auth,
        'Accept': 'application/json',
      },
    });

    const body = await res.text();
    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
      body,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
