# Company Bible — Hanafi Learning Deck

This document records the operating rules that govern work on this repository.

## 1. Authority and approval

- The maintainer has final approval over every build, patch, card, image, version change, and publication decision.
- Discussion, suggestions, previews, bug reports, or candidate artwork are **not approval**.
- No candidate becomes part of the project until it is explicitly approved.
- If the maintainer says **stop**, work stops immediately. No further project files are changed.

## 2. Scope first

Before changing the project, establish the exact requested scope.

- Do only the requested work.
- Do not add unrelated changes because they seem convenient.
- Do not guess when a missing detail could materially change the result.
- If the requested scope expands, stop and get approval for the expanded scope before proceeding.
- Preserve working behavior and accepted material unless a change is specifically requested.

## 3. One approved step at a time

- Work from the current accepted repository state.
- Make one controlled change or approved group of closely related changes at a time.
- Failed or rejected candidates are not new baselines.
- Do not silently replace an approved asset with a new interpretation.
- Once a fragile or device-specific implementation has been accepted and the maintainer marks it as locked, future work must go around it rather than through it unless the maintainer explicitly reopens that implementation.

### Locked Media player

The **v2.1 DK Media single-player Web implementation** is the accepted Media-player baseline.

- The Media page uses **one video player total**. Media choices switch the source loaded into that single player; separate stacked players are not the accepted design.
- **DK Media Player** is the behavioral/design base for the browser player. The Web App reimplements the useful player behavior in HTML/CSS/JavaScript rather than embedding the desktop Python/libVLC application.
- Preserve the accepted single-player structure, media selector, seek timeline, play/pause, rewind/forward controls, volume, speed, fullscreen, keyboard controls, resume state, and external-subtitle on/off behavior unless the maintainer explicitly requests a player change.
- **Nougat Media Plus** is used only for useful server/media infrastructure. Its desktop military/tactical player UI is not the Hanafi Media-player design.
- Jellyfin remains backend infrastructure and is not exposed as the user-facing Hanafi player.
- Future Media additions should normally be added to the library/manifest and fed into the accepted single player rather than creating new player instances.
- The previous Google Drive iframe player and its old mobile iframe workaround are historical implementations and are no longer the accepted Media baseline.

For the **Important Places of the Muslim World** expansion, the rule is especially strict:

1. Prepare one candidate card.
2. Show it to the maintainer before publication.
3. The maintainer screens the wording, image choice, layout, border, and overall visual quality.
4. Only an explicitly approved card is added to GitHub.
5. Move to the next card only after the previous card is accepted.

## 4. Exact approved assets stay exact

When the maintainer approves or supplies a final image:

- upload **that exact card**, not a substitute;
- do not redraw, regenerate, resize, recolor, restyle, crop, replace the photograph, or reinterpret it unless explicitly instructed;
- do not choose a merely convenient image when visual quality is part of the card's purpose;
- for photographic cards, the picture must clearly and attractively represent the subject.

Binary images that already exist as final files should be uploaded directly as Git blobs whenever possible. See [`build-notes.md`](build-notes.md).

## 5. Islamic content rules

- The main fiqh framework is Hanafi.
- A ruling from another madhhab is not a correction to a Hanafi card merely because it is authentically sourced in that school.
- Proposed legal corrections require a specific named source and must be evaluated within Hanafi legal methodology.
- Where a recognized Hanafi difference matters, the card should identify the difference rather than flattening it.
- Qur'an, hadith, history, and later reports must not be blurred together as though they carry identical evidentiary weight.
- The deck remains a study aid and is still subject to imam/scholar review.

## 6. Versioning and checkpoints

- Version numbers change only with explicit maintainer authorization.
- Every visible version surface must agree after an approved version change.
- A rejected candidate does not advance the version.
- Current accepted Web App checkpoint: **v2.1**.
- **v2.1 is closed.** No later public version number is assigned until the maintainer explicitly names one.
- The Home page is the canonical user-facing version display. Interior pages do not need visible version labels unless the maintainer specifically wants them.
- Internal release/cache identifiers may still exist where technically required, but they must not silently advance the public version.

## 7. Repository organization

- Main deck and each expansion remain separate.
- Expansion numbering starts at Card 1 and is independent of the main deck.
- Development documentation belongs in `docs/`.
- Scholarly/source material stays in the audit/source files and expansion-specific source notes.
- Temporary workflows used for one-time repository operations must be removed after the successful operation.
- Do not leave unrelated files, experiments, or temporary artifacts in the repository.

### Restricted / Secret Library documentation

The Web App may contain a restricted advanced-study library intended for serious research material.

- Public documentation may describe its purpose, content standards, and maintenance rules.
- Public documentation must **not disclose the hidden access gesture, click/tap count, research key, or equivalent unlocking secret** unless the maintainer explicitly orders that information published.
- The locked gate and the unlocked library are separate UI states over the same approved library environment.
- Unlocking removes the gate UI; it should not replace the library environment with an unrelated page.
- Restricted content still follows the same source, attribution, Hanafi-methodology, and review rules as the rest of the project.

## 8. Validation before claiming success

Before saying a repository change is complete:

- verify the target branch and current head;
- verify the intended path exists;
- verify the uploaded/updated file SHA and size when relevant;
- verify no unintended file was replaced;
- verify temporary tooling has been removed;
- report failures plainly rather than calling an incomplete operation successful.

## 9. Release and archive discipline

- Changed-files packages are preferred when a package is needed; a full-project package is created only when explicitly requested.
- Hashes and manifests should be retained where appropriate.
- Accepted states are the basis for future work.
- Git history is an audit trail and should remain understandable.

## 10. Purpose

The Hanafi Learning Deck exists for Islamic education and benefit, not commercial profit. The goal is to create practical material that helps a learner move from curiosity to understanding, from memorization to practice, and from translated summaries toward deeper study of the Qur'an, Sunnah, Arabic, Hanafi fiqh, Islamic history, and the Muslim world.
