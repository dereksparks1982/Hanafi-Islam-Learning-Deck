# Legal and Source Policy

## Purpose

The Hanafi Learning Deck began as a small personal study aid and has grown into a broader noncommercial Islamic learning project. The repository now includes or plans to include printable study cards, an installable Web App, a Qur'an reader, prayer-time tools, an interactive Holy Places Explorer, Islamic history and ruins material, educational media, and other learning resources.

The project's purpose is the spread of beneficial Islamic knowledge. It is not built around advertising, subscriptions, paywalls, behavioral tracking, or the commercial sale of access to religious material.

## The Qur'an is revelation, not project property

The project does **not** claim ownership of the Qur'an itself. The Arabic Qur'an is treated as revelation from Allah and as sacred source text that must not be silently altered.

Human work surrounding the Qur'an is tracked separately. This includes translations, transliterations, annotations, typography, software, databases, page metadata, recordings, photographs, and other editorial or technical work.

Whenever the project uses a human translation or another externally produced source, the source and translator should be identified as clearly as possible. Attribution is part of the project's scholarly record even where the project disputes the idea that access to religious knowledge should be monopolized.

## Shariah discussion of intellectual property

Contemporary Muslim scholars have disagreed over whether modern intellectual-property rights are recognized by Shariah.

Mufti Muhammad Taqi Usmani records one contemporary scholarly position that rejects intellectual property as a form of private ownership. He summarizes its reasoning as follows: classical ownership concerned tangible property; the Qur'an, Sunnah, and classical juristic literature do not provide a clear precedent for privately owning intangible knowledge; and knowledge in Islam is not the property of an individual who may prevent others from acquiring it. He also records the opposing contemporary position and ultimately accepts intellectual-property rights.

Source: https://islamqa.org/hanafi/albalagh/22252/copyright-according-to-shariah/

The International Islamic Fiqh Academy adopted the other position in Resolution No. 43 (5/5), issued in 1988, recognizing literary production, copyrights, and patent rights as rights protected by Shariah.

Source: https://iifa-aifi.org/en/54157.html

The existence of this disagreement matters to this project. The repository will not pretend that there is one unanimous Islamic position on modern copyright.

## Project position on access to Islamic knowledge

The project is guided by the principle that the Qur'an, Sunnah, and beneficial Islamic knowledge should be made genuinely accessible for study and teaching.

For Qur'an-related material, the project will therefore:

- keep access free of charge;
- carry no advertising or commercial paywall around the Qur'an reader;
- identify translators and source editions rather than presenting their work anonymously;
- preserve source provenance and version information;
- distinguish the Arabic Qur'an from human translation and commentary;
- create original transliteration and explanatory material where practical;
- prefer public-domain, permissively licensed, or openly redistributable sources when they meet the required scholarly standard;
- document restrictive terms when the strongest available scholarly source carries them rather than pretending those terms do not exist;
- review any source dispute on its merits and, where necessary, replace disputed human wording with an independently prepared rendering rather than compromise the integrity or free availability of the project.

This policy records the project's religious and scholarly position. It is not a statement that civil copyright law ceases to exist, and it is not a claim that every third-party work used or linked by the project is covered by the project's own license.

## Project-created material and third-party material

The repository's **CC BY-NC-SA 4.0** license applies to original Hanafi Learning Deck material to the extent that the project has the right to license it.

Third-party material does **not** automatically become CC BY-NC-SA merely because it is present in the repository, displayed in the Web App, hosted or streamed through project infrastructure, embedded from another service, or linked from project documentation. A third-party text, translation, photograph, recording, film, dataset, software library, or other work may carry its own legal or attribution terms. Those terms should be recorded with the source whenever practical.

The project does not claim authorship of externally created translations, photographs, films, recordings, historical documents, software libraries, or other source material.

## Media, self-hosting, and external sources

The Media area distinguishes between:

1. the Hanafi Learning Deck's own interface/integration code;
2. the maintainer's own DK Media and Nougat integration work used as technical infrastructure; and
3. the underlying third-party films, recordings, sources, services, and software components.

The v1.9 Media release originally used a **Google Drive embedded player**. That is now historical. In v2.1 the accepted Media architecture moved to self-hosting from the maintainer's own machine through the Hanafi Web App, Nginx, the narrow Hanafi media bridge, and selected Nougat/Jellyfin backend infrastructure.

The current architecture does **not** place movie files in the GitHub repository. GitHub contains the Web interface, stable media IDs, manifest examples, bridge/server code, and deployment tooling. The media payloads remain on the maintainer's local Hosted storage.

For *The Message* (1976), **الرسالة / Al-Risalah (1976)**, *The Ten Commandments* (1923), and later third-party Media entries:

- the underlying films remain third-party works unless a particular work's status is separately established;
- the Hanafi Learning Deck does not claim authorship or ownership merely because it hosts, streams, indexes, or presents a project copy;
- the project's CC BY-NC-SA license does not automatically relicense the underlying films;
- hosting a copy on the maintainer's own machine rather than Google Drive does not itself change the legal or source status of the underlying film;
- source/provenance information should be preserved where it is actually known;
- the project should not invent provenance or imply certainty about a project copy when its provenance cannot be reliably accounted for;
- film information and historical notes must remain distinct from Qur'an, hadith, fiqh, and other primary or scholarly religious sources;
- inclusion in the Media area is not a declaration that a film is public domain or otherwise free of third-party rights.

Temporary project copies from sources such as YouTube may be used during development/testing and should be identified as such where their source is known. Later replacement with a better or lawfully acquired edition does not convert the underlying film into project-owned material and should preserve whatever source/edition record is actually known.

## Player, server, and third-party software attribution

The current v2.1 browser player is a Hanafi Web implementation based on the maintainer's separate **DK Media Player** project's player behavior. It uses the browser's video APIs and does **not** embed the DK Media desktop Python/Tkinter/libVLC executable.

Selected **Nougat Media Plus** server work is reused for media infrastructure, including the local backend/Jellyfin integration, HTTP delivery, transcoding/fallback concepts, and related deployment work. Nougat's desktop tactical/military Player UI is not the Hanafi Web player's interface.

Third-party software retains its own identity and license terms. This includes, where used in the deployment path, components such as Jellyfin, FFmpeg, Nginx, Certbot/Let's Encrypt tooling, and any other external library or runtime.

The current Hanafi Web player does **not** bundle VLC/libVLC merely because the separate DK Media desktop application and parts of Nougat may use VideoLAN technology. If VLC/libVLC is ever incorporated directly into the Hanafi Web App or distributed as part of a Hanafi package, the applicable VideoLAN attribution and license obligations must be documented for that integration.

## External subtitles

The v2.1 Media bridge can associate one optional external subtitle file with a media item. An SRT file is converted to WebVTT for browser playback.

A downloaded or separately created subtitle remains its own work/source layer and should not be assumed to have the same authorship, provenance, or legal status as the video file it accompanies. Where subtitle provenance is known, it should be recorded rather than silently attributed to the film or project.

This sidecar model is technically useful because one clean video master can be reused without creating another encoded copy solely to burn subtitles into the picture.

## External sites and references

External services and sources retain their own identities and applicable terms. Examples used or referenced by the project may include YouTube, Google Drive, IMDb, Wikipedia, the Academy of Motion Picture Arts and Sciences, Turner Classic Movies, charitable organizations, mapping/imagery providers, and other outside resources.

Linking to, embedding from, citing, or replacing a service with self-hosted delivery does not make the external service's content project property.

## Qur'an source integrity

The Qur'an reader is intended to use a verified Hafs 'an 'Asim Arabic text corresponding to the Madinah Mushaf tradition, with an independent verification source. Arabic source text should be treated as immutable after verification except through an explicit correction process supported by authoritative evidence.

The project-created transliteration is a learning aid, not a replacement for the Arabic Qur'an. English renderings are likewise human attempts to convey meaning and must be identified as such.

## Corrections and disputes

Scholarly corrections should be supported with a named source. Legal or source complaints should identify the specific work, passage, file, recording, film, image, dataset, or other material and the asserted right or term at issue.

The project should answer such disputes transparently: identify what source was used where known, why it was selected, what attribution was provided, and whether the material should remain, be replaced, be independently recreated, or be removed.

The goal is not to obscure provenance. The goal is to keep Islamic learning material free, traceable, reviewable, and as accurate as the project can make it.

## Contact for legal, licensing, and source matters

For rights claims, licensing questions, attribution disputes, source complaints, or other legal correspondence concerning the Hanafi Learning Deck, contact:

**hanaficards@proton.me**

A claim should identify the material at issue, the person or entity asserting the claim, the source or edition involved, the right or restriction being asserted, any supporting documentation, and the action or remedy requested. This allows the matter to be evaluated against the project's source record, attribution history, applicable license terms, relevant civil-law questions where necessary, and the documented Shariah analysis.

A standalone contact page is also maintained at [`../CONTACT.md`](../CONTACT.md).
