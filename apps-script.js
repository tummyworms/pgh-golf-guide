var SITE_URL = 'https://golf-guide-ef34e.web.app';

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'notify') {
    var review = {
      courseName: e.parameter.courseName,
      excerpt:    e.parameter.excerpt,
      body:       e.parameter.body,
      rating:     parseInt(e.parameter.rating) || 0,
      id:         e.parameter.id,
    };
    sendCampaign(review);
  }
  return ContentService.createTextOutput('ok');
}

function sendCampaign(review) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('MAILERLITE_API_KEY');

  var headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  };

  var groupsRes = UrlFetchApp.fetch(
    'https://connect.mailerlite.com/api/groups?limit=1',
    { headers: headers }
  );
  var groups = JSON.parse(groupsRes.getContentText()).data;
  if (!groups || groups.length === 0) return;
  var groupId = groups[0].id;

  var courseName = review.courseName;
  var rating = review.rating || 0;
  var excerpt = review.excerpt;
  var body = review.body;
  var postId = review.id;
  var stars = rating + ' out of 5 stars';
  var reviewUrl = SITE_URL + '/post.html?id=' + postId;
  var limit = Math.floor(body.length * 0.4);
  var cut = body.lastIndexOf('.', limit);
  var preview = cut > 50 ? body.slice(0, cut + 1) : body.slice(0, limit);

  var html = '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">'
    + '<p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase">New Review</p>'
    + '<h1 style="margin:0 0 8px;font-size:24px;color:#111">' + courseName + '</h1>'
    + '<p style="margin:0 0 6px;color:#c8900a">' + stars + '</p>'
    + '<p style="margin:0 0 20px;color:#555;font-style:italic">' + excerpt + '</p>'
    + '<p style="margin:0 0 28px;color:#333;line-height:1.7">' + preview + '...</p>'
    + '<a href="' + reviewUrl + '" style="background:#c8900a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold">Read the Full Review</a>'
    + '</div>';

  var createRes = UrlFetchApp.fetch('https://connect.mailerlite.com/api/campaigns', {
    method: 'post',
    headers: headers,
    payload: JSON.stringify({
      name: 'Review: ' + courseName,
      type: 'regular',
      subject: 'New Review: ' + courseName,
      from: Session.getEffectiveUser().getEmail(),
      from_name: 'Pittsburgh Golf Guide',
      groups: [groupId],
      content: { html: html }
    })
  });

  var campaignId = JSON.parse(createRes.getContentText()).data.id;

  UrlFetchApp.fetch(
    'https://connect.mailerlite.com/api/campaigns/' + campaignId + '/actions/send',
    { method: 'post', headers: headers, payload: '{}' }
  );
}
