# Hanafi ↔ Folkhold Majlis Bridge

## Purpose

The Hanafi Learning Deck and Folkhold remain separate projects that complement one another.

Derek's product metaphor is:

- **Hanafi is the mother**: learning, faith, practice, reference, and guidance.
- **Folkhold is the father**: community, people, rooms, gathering, and social life.

Neither repository is absorbed into the other.

## Why the button is called Majlis

The community doorway is named **Majlis**.

`Majlis` fits the intended meaning of a gathering/sitting/assembly without presenting the Hanafi Learning Deck as an accredited religious council or formal consultative authority. For that reason, **Shura** is not the chosen label.

## Current behavior

Hanafi's Web App home adds a **Majlis** action.

The Links page also uses **Majlis** for the Folkhold community doorway.

Both target:

`https://dereksparks1982.github.io/folkhold/?from=hanafi#square`

Folkhold recognizes the `from=hanafi` navigation marker, stores that origin only for the browser session, and displays **← Hanafi** so the visitor can return while still retaining normal Folkhold navigation.

## Security / authority boundary

The origin marker is navigation context only.

It must never grant:

- authentication
- Keys
- private Room access
- moderation privileges
- religious authority
- any different class of Folkhold account

## Breadcrumb

The Majlis bridge was designed during the Folkhold v1.1.0 closeout discussion and implemented across the two projects on October 1, 2026. The intention is to make the sites feel like neighboring places with a deliberate doorway between them rather than duplicating either application's purpose.
