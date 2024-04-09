/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { createEmptyContact, getContacts } from "~/data";

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import appStylesHref from './app.css?url';
import { useEffect, useState } from "react";

export const loader = async ({
  request
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const contacts = await getContacts(q);
  return json({ contacts, q });
}

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref }
];

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState(q || "");
  const submit = useSubmit();

  const navigation = useNavigation();

  const searching = navigation.location && new URLSearchParams(navigation.location.search).has('q');

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form 
              id="search-form"
              role="search"
              onChange={(e) => {
                const isFirstSearch = q === null;
                submit(e.currentTarget, {
                  replace: !isFirstSearch,
                })
              }}
            >
              <input
                id="q"
                className={searching ? "loading" : ""}
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                onChange={(e) => setQuery(e.currentTarget.value)}
                value={query}
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            <ul>
              {contacts.length && contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink 
                    className={({ isActive, isPending }) => 
                      isActive
                        ? "active"
                        : isPending
                        ? "pending"
                        : ""
                    }
                    to={`contacts/${contact.id}`}>
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : ( <i>No Name</i>
                    )}{" "}
                    {contact.favorite && (
                      <span>⭐</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div 
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
          id="detail"
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
