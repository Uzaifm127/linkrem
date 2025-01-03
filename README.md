1. When user try to add multiple links then what will happen with the request? Will it be a batch request?

1. Improve the authentication system:
   a. Implement the login with email and password
   b. Improves the UI.
1. implement the session functionality:
   a. session and link tab
   b. session fetching API
   c. creating a session on clicking a button except for the current URL.
   d. change the dynamic extension id to permanent id in route.ts files in cors in the URL after publishing the extension, till then keep the cors domain \* in the route.ts files for extension
1. Implement the invalidate with react query in the add CREATE, UPDATE and DELETE APIs in both (extension and web app).

## Changes for later
in PUT request of links, we need to send the changes boolean state from client if the information sent to the client is already exist in other links too. we're only checking it for the current link, but we need to check it for all the links.