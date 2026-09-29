# Nougat Media Suite Company Bible

**Status:** Canonical project operating law  
**Scope:** Nougat Media Suite only  
**Authority:** The owner has final authority over scope, acceptance, release state, and exceptions.

## 1. Purpose

This is the one canonical project Bible for Nougat Media Suite. It defines how Nougat Media Suite is planned, changed, validated, packaged, explained, committed, published, and recovered. It must not contain rules, source, secrets, history, or identifying material from unrelated projects.

No second Nougat Media Suite Bible may be created. Amend this file in an owner-approved build when a durable Nougat Media Suite rule changes.

## 2. Owner authority and stop law

- The owner's explicit instruction overrides a proposal, plan, convention, or inferred preference.
- When the owner says **stop**, all building, editing, packaging, command generation, and tool activity stops immediately.
- Work resumes only after a new explicit owner instruction.
- No unapproved feature, cleanup, redesign, dependency, icon, launcher behavior, or workflow change may be slipped into a build.
- A real scope conflict must be reported before work continues. Ordinary implementation details inside approved scope do not require repeated approval.

## 2A. Literal owner-direction and uninterrupted-execution law

- The owners explicit instruction defines the exact scope. Do not broaden, reinterpret, substitute, rename, improve, or add adjacent or future work that was not requested.
- Follow the owners stated workflow instead of replacing it with an assistant-preferred workflow, prerequisite, package, download, inspection step, or alternate deliverable.
- When the owner requests one terminal command, provide one complete copy-and-paste command for the entire requested operation. Do not split it into multiple commands unless explicitly requested.
- Do not substitute verification, explanation, inspection, or a progress report for the action the owner requested. Required checks should be included inside the requested operation when practical.
- Once an operation is authorized, continue through the complete approved scope without pausing to narrate progress, announce checks, ask for intermediate permission, or provide status updates unless the owner explicitly asks for a progress report.
- An authorized operation stops only when the owner explicitly says stop or when a concrete blocker materially prevents continuation. If a direct fix exists inside the approved scope, apply it and continue.
- Do not repeat a command style, package, workflow, or method the owner has rejected unless the owner explicitly requests it again.
- When GitHub publication is requested, use the established local Git and SSH GitHub publication workflow. Do not substitute a downloadable package or unrelated handoff.
- Do not introduce a future version number, future build label, rename, roadmap item, or other unrequested material when the owner instructed that only the current version be documented.

## 3. Required reading order

Before changing Nougat Media Suite, read:

1. this Bible in full;
2. the current roadmap;
3. the current known-bugs record;
4. the current changelog;
5. the latest relevant handshake and validation records;
6. the source paths affected by the approved build.

The active Git commit, branch, worktree state, expected executable, rollback snapshot, and relevant runtime state must be verified before changes are applied.

## 3A. Mandatory Bible reading and README release law

- Before every Nougat Media Plus build, repair, patch, validation, packaging operation, checkpoint closeout, acceptance closeout, local Git commit, release tag, or GitHub publication, the canonical `COMPANY_BIBLE.md` must be read in full. Memory, summaries, prior-chat recollection, and assumptions are not substitutes for reading the current file.
- The existing `README.md` introduction is persistent project documentation. It must remain intact unless the owner explicitly requests an introduction rewrite.
- New owner-approved capabilities must be added to the existing README introduction using the smallest appropriate additions. Established introduction text must not be silently rewritten, condensed, reordered, or removed merely to document a new version.
- Every accepted build, checkpoint closeout, or GitHub publication that changes current capabilities must update both the maintained `README.md` introduction and the newest version release notes. Adding only a version section does not satisfy the README requirement.
- Before updating the README introduction for a build, repair, checkpoint, or release, the complete current `README.md` must be read, including the full historical release record. Reading only the existing introduction or newest release notes is not sufficient.
- The README introduction must represent the complete current user-visible Nougat feature set established across the release history, while excluding features that newer releases explicitly removed, superseded, rejected, or leave only as future roadmap work.
- New capabilities must be integrated into their appropriate readable introduction sections. Do not satisfy the README-update requirement by attaching one catch-all paragraph for the newest version while established current features remain buried only in release history.
- The introduction remains organized as readable product sections and paragraphs rather than becoming a raw changelog or giant feature dump.
- Immediately below the maintained README introduction, the newest version number and its release notes must appear before all older version sections.
- Older release sections remain historical records and are not rewritten to make them look current.
- A candidate, repair, checkpoint, or release may not be represented as accepted, closed out, saved, tagged, or ready for GitHub publication until `README.md` accurately describes that exact state.
- A checkpoint that still has known problems must say so truthfully in its newest README release notes. A checkpoint is not automatically an accepted final release.
- If the README has not been updated according to these rules, the build is not accepted and the closeout is incomplete.
- A README update required for a checkpoint, acceptance, release, commit, or GitHub closeout is not complete merely because `README.md` was modified locally. The updated `README.md` must be included in the same Git commit as the saved build state, pushed to the configured GitHub repository, and the remote `README.md` at that exact commit must be verified before the checkpoint, release, or closeout may be reported complete.
- The three states `README updated locally`, `README committed locally`, and `README verified on GitHub` are distinct and must never be reported as interchangeable.
- When historical version-specific UI rules conflict with a newer explicit owner-approved UI rule, the newer owner-approved rule is the active authority. Historical rules remain historical and must not be resurrected as current styling.

## 4. Build-scope law

- Restate the proposed build with its base, goal, included work, exclusions, tests, package name, and acceptance boundary.
- Do not start implementation until the owner approves that scope.
- Complete every approved item in the same build unless the owner approves a split or a genuine blocker is reported.
- Do not silently defer an approved item to a future version.
- Fix the cause, not merely the visible symptom.
- Preserve working behavior outside the approved scope.

## 5. Version and repair law

- New owner-approved functionality advances the numeric version.
- A candidate that fails validation or owner testing is repaired under the same numeric version until it passes or the owner changes the plan.
- A technically working checkpoint is not automatically accepted.
- Do not tag a build as accepted or final before explicit owner acceptance.
- Build records must distinguish proposed, candidate, technically working, accepted, rejected, and repaired states accurately.

## 6. Source and privacy law

- The repository contains Nougat Media Suite material and its own historical ReddMedia lineage only.
- Do not place credentials, tokens, API keys, personal data, unrelated private-project material, generated runtime trees, caches, or build debris in Git.
- Runtime state belongs under the user's standard config, data, and cache directories.
- Credentials must be stored with owner-only permissions and must never be printed in logs, terminal commands, process arguments when avoidable, documentation, test output, commits, or packages.
- User media must never be deleted by a library unlink, refresh, repair, rollback, or uninstall operation.

## 6A. Licensing and contribution law

- The project licensor/copyright identity for owner-controlled Original Materials is **Elderred Softworks LLC**.
- Original Materials are licensed to recipients under the **PolyForm Noncommercial License 1.0.0** unless the owner explicitly approves a different license for a defined file or release.
- The recipient license does not restrict Elderred Softworks LLC from commercially using, distributing, sublicensing, dual-licensing, or relicensing its own Original Materials.
- A project-level license never relicenses third-party software, models, artwork, services, APIs, or data. Upstream notices and license copies must remain intact.
- Outside contributions may enter the project only under the owner-approved contributor terms in `CONTRIBUTING.md`, including an inbound grant broad enough to preserve the owner's ability to maintain, sublicense, relicense, and commercially license the combined project.
- No build may change `LICENSE`, `COPYRIGHT.md`, `CONTRIBUTING.md`, `THIRD_PARTY_NOTICES.md`, or `docs/LICENSING_POLICY.md` without explicit owner approval.
- A release must run the current license-boundary regression test before handoff.

## 7. Nougat Media Suite identity law

The owner-approved rounded-square chocolate/caramel **N** emblem at the top center of `docs/design/NOUGAT_UI_COMPONENT_SHEET_APPROVED.png` is Nougat Media Suite's sole active icon source beginning with v0.0.21. The concept sheet itself is the authority. Do not redraw, regenerate, substitute, approximate, or replace the N with generic executable, gear, letter, or placeholder artwork.

**NO EXCEPTIONS RELEASE GATE:** every Nougat Media Suite build, patch, repair, hotfix, and version bump must preserve and verify that exact approved N on every active application identity surface before the candidate may be handed to the owner. This requirement is permanent and is not optional even when the build scope is unrelated to artwork.

The mandatory identity surfaces are:
- the raw versioned root executable as shown by Files/Nautilus;
- the installed application launcher/menu entry;
- the running X11 window identity and `_NET_WM_ICON`;
- the Ubuntu/GNOME dock and app-switcher identity;
- the in-app Nougat badge where used.

The final raw versioned executable must be written first and is a mandatory handoff artifact. Only after the final executable bytes are in place may its `metadata::custom-icon` be set directly to the approved concept-sheet N master URI. The metadata must immediately be read back and proved to resolve to that exact master. Rebuilding, moving, or replacing the executable after that proof invalidates the icon gate and requires the icon assignment and verification to be repeated.

Each version-changing build must also refresh the approved icon-theme assets and canonical desktop launchers as required, verify their icon key and executable target, and refresh desktop/icon caches when the relevant host utilities are available. A generic icon on any required surface is a build rejection, not a cosmetic follow-up.

Automated validation must verify the approved concept-sheet source, approved N master, embedded X11 icon-data source, launcher icon key, and raw-executable custom-icon readback. Owner visual confirmation in Files/Nautilus and the running dock remains required for final acceptance.

The accepted red-tree artwork remains historical ReddMedia identity through v0.0.20 and must not remain as the active Nougat identity.

## 8. Media-server ownership law

- Nougat Media Suite may start and supervise its integrated Jellyfin process.
- After **Start Server**, a Nougat-owned server is intentionally independent of the desktop UI and must remain running across normal UI close or UI crash until **Stop Server** is explicitly used.
- Reopening Nougat must validate and adopt only the recorded Nougat-owned server; stale PID metadata must never authorize killing an unrelated process.
- A separately started Jellyfin process must not be claimed or killed by Nougat Media Suite.
- Start Server, Stop Server, and Refresh Server controls must report their real state.
- Stop Server records the explicit stopped preference. Nougat must not add operating-system boot autostart unless the owner separately approves it.
- Server data, config, cache, logs, ownership metadata, and the bundled runtime remain separate from Git-tracked source.

## 9. Library and Discover law

- Movies and TV are distinct types at the API, model, filtering, selection, test, and UI boundaries.
- A Movie action may return only a movie. A TV action may return only a TV title.
- Library browsing uses real catalog metadata and direct local paths.
- Linking and unlinking folders changes the catalog only and never modifies the owner's media files.
- Posters use real Jellyfin or TMDb artwork, are cached locally, and fall back to **NO POSTER** only when no usable image exists.
- Episode tiles must show verified season and episode numbers plus a verified episode title. Technical format belongs on a secondary line. Missing identity stays explicitly unavailable until an exact catalog or TMDb match supplies it.
- External recommendations use TMDb only when the owner supplies a valid API key or read access token.
- A replacement credential must validate before it replaces the currently working credential.
- The owner must be able to Test, Save/Replace, and Clear the TMDb credential.
- A 401 response must be explained clearly without exposing the credential.
- Random recommendations do not use viewing history. Usual recommendations may use private local viewing history and local embeddings.
- Nougat Media Suite must never invent a title to hide an API, catalog, model, or network failure.
- Watch availability uses the exact owner-selected region and the complete provider categories returned through TMDb's JustWatch data. ReddMedia must show attribution, freshness, and an explicit no-listing state; it must not infer availability or bypass a provider's official playback path.

## 10. Diagnostic truth law

- Debug and health surfaces may report only facts backed by current process state, API responses, filesystem checks, catalog fields, or recorded request failures.
- Green means no active problem was detected by the checks that actually ran. Yellow means a recoverable or incomplete state needs attention. Red means a required service, runtime, path, or operation is unavailable or failed.
- Diagnostics must identify evidence and a relevant next action, keep credentials redacted, and distinguish a missing field from a failed request.
- Refresh Metadata, Test TMDb, Refresh Server, Open Logs, Retry, and Copy Report must invoke their real corresponding actions when presented.

## 11. Responsiveness and progress law

- Network, catalog, poster, inference, and server operations must not freeze the main UI.
- A full-width palette-aware progress surface must appear while approved Library, poster, Discover, TMDb, or server work is active.
- Use measured progress when the work has measurable stages or item counts.
- Use a moving indeterminate state when total work cannot be measured honestly.
- Fast operations may complete the bar quickly; slow operations must continue to show activity.

## 12. Engineering and validation law

- Warnings are errors for release builds.
- Tests must exercise behavior, not only search source text.
- Every fixed owner-reported defect receives a regression test when deterministic automation is practical.
- Validate both success and failure paths, including invalid credentials, 401 handling, credential replacement preservation, missing artwork, type crossover, independent-server preservation, persistent-owned-server survival/explicit shutdown, independent-server preservation, and generated-runtime Git exclusions.
- Stub tests may provide deterministic isolation, but required real-runtime and owner-visible gates must still be identified and performed.
- No test may use the owner's real credential or media.

## 13. Changed-files package law

The normal handoff is one changed-files-only ZIP containing exactly the files required to move the verified base to the candidate.

**NO INSTALLERS:** Nougat Media Suite handoff packages must not contain, generate, or require an installer. The owner receives the changed files and the final runnable versioned root executable directly.

The package must include:

- the final runnable versioned root executable for the candidate, with the exact approved Nougat N identity preserved and verified;
- a manifest with file paths, byte counts, and SHA-256 hashes;
- changed source and documentation;
- required tests and build records;
- required license updates.

The package must not include generated runtime directories, caches, temporary build trees, credentials, or unrelated files. The ZIP itself must pass an integrity test before delivery.

## 14. Package apply and rollback law

- Preflight must verify the exact approved base commit, branch, tracked worktree, staged state, executable version, rollback snapshot, and required tools.
- Expected generated runtime directories may remain untracked and must be preserved.
- Unexpected tracked or untracked changes are a stop condition; do not erase them.
- Verify the package manifest before applying files.
- Build in a temporary directory and replace the active executable only after validation succeeds.
- If package application or executable replacement fails after application begins, restore the exact prior tracked state and active executable while preserving user data and expected runtimes.
- Never report rollback or package application as passed unless the proof actually passed.

## 15. Terminal-command communication law

When the owner must run a command:

- every Nougat Media Suite **repair, build, validation, package-apply, or acceptance-preflight** terminal block must begin with a safe runtime-shutdown stage before build or filesystem work begins;
- that shutdown stage must stop any running Nougat Media Suite application process and the **verified Nougat-owned integrated Jellyfin** process, then verify both are down before continuing;
- never kill Jellyfin blindly by process name. Use Nougat ownership/runtime evidence (including the recorded ownership file/runtime path where available). If Jellyfin ownership is ambiguous, print a clear STOP/FAIL message with the relevant PID/process information and leave the unknown process running for owner review;
- if the owner explicitly instructs that an independently started Jellyfin instance should also be stopped, that broader shutdown is allowed for that operation;
- terminal command blocks must contain commands only: never include the shell prompt (for example `user@host:~$`) or copied/expected terminal output as executable lines;
- first state exactly what the command does and whether it is snapshot, Git, GitHub, package-apply, validation, or another operation;
- provide one complete copy-and-paste command block for that operation;
- ensure all quoting and multiline messages terminate correctly;
- A terminal command is rejected if it leaves the owner at a shell continuation prompt such as `>`. When one command is requested, it must be one syntactically complete physical command line with no heredoc, dangling quote, trailing continuation backslash, or other construct requiring the owner to type additional input;
- do not leave the shell at a continuation prompt;
- Nougat terminal commands must be non-interactive by default. They must not open `less`, `more`, `vim`, `nano`, another editor, a Git pager, or any other interactive viewer unless the owner explicitly requests that behavior.
- Git output intended only for inspection must use non-interactive output such as `git --no-pager`, `GIT_PAGER=cat`, or an equivalent method.
- Commands must complete their work and return control directly to the shell instead of leaving the owner inside a pager, editor, continuation prompt, or interactive application.
- do not put `exit`, `exit 1`, or a command that closes the owner's terminal in the block;
- do not claim success until the owner pastes the result;
- explain the pasted output before starting any new work.

Snapshot, local Git commit, and GitHub push are three separately named operations. Each should require one correct command in its stage.

## 16. Checkpoint, Git, and GitHub law

**OWNER COMMIT SHORTHAND LAW:** When the owner says **commit**, that instruction means the complete Nougat save-and-publish sequence automatically: create and verify the required snapshot, create and verify the local Git commit, create/update the release tag when applicable, push the exact commit and tag to the configured GitHub remote, and verify GitHub resolves to that exact commit. Do not interpret the owner's word **commit** as local Git only unless the owner explicitly says **local commit only**.

After the owner approves saving a state:

1. create and verify one recoverable snapshot;
2. stage the intended source while excluding generated runtimes and caches;
3. inspect staged names and whitespace errors;
4. create one descriptive local Git commit that records accomplishments and known issues honestly;
5. verify the new commit and worktree state;
6. push the exact commit to the configured GitHub remote;
7. verify the remote branch resolves to the local commit.

Large tracked assets must be explained when GitHub reports size warnings. New large binary assets should use an owner-approved distribution or large-file strategy rather than silently expanding normal Git history.

## 17. Acceptance checklist

A Nougat Media Suite candidate is ready for owner testing only when:

- the approved scope is complete;
- builds and automated validation pass;
- the package and manifest pass;
- rollback behavior is proven;
- generated runtimes remain excluded from Git;
- version and documentation agree;
- persistent owned-server survival across UI exit and explicit Stop Server shutdown are proven;
- Movie/TV separation is proven;
- TMDb credential lifecycle and poster paths are proven;
- the final raw executable has the approved Nougat Media Suite icon metadata assignment read back;
- the owner receives the final runnable versioned root executable with the exact approved Nougat N icon verified, plus one clearly explained package-apply command only when filesystem changes beyond replacing the executable are required, and the explicit remaining visual checks.

Only the owner decides whether the candidate is accepted.

## 18. Search inside Nougat Media Suite

1. The decentralized Nougat engine is the integrated **Search** subsystem inside Nougat Media Suite.
2. Beginning with v0.0.33, the owner-approved top-level order is `Home | Video Player | Library | Discover | Live TV | Search | Stream | Debug`. Media/torrent P2P and Virus Scan remain under Search, not as top-level areas.
3. Accepted behavior remains preserved when identity/palette work changes unless functionality is explicitly approved.
4. Search uses the approved cocoa/chocolate/nougat-cream/caramel palette. Its ordinary internal sections are `Search | Crawler | P2P | Virus Scan`; decentralized peer/node administration is available only through a smaller Network/Advanced surface.
5. Read-only Search output remains selectable/copyable with normal mouse selection, Ctrl+C, Ctrl+A, and right-click Copy/Select All.
6. Nougat Media Suite owner-created code is distributed to recipients for noncommercial use under the project license; third-party components retain upstream licenses; the owner retains all rights not granted.
7. Active Search data remains under the backward-compatible existing user-data tree.

### v0.0.32 Security Analysis law

- `Virus Scan` is a normal internal Search section beside P2P and uses the approved Search UI family.
- Nougat Security Analysis is one-shot/on-demand: manual scans and completed Nougat downloads may launch a scanner worker, but no resident antivirus daemon or filesystem watcher is installed by Nougat.
- Security findings use the owner-approved **WARN ME FIRST** policy. Nougat never automatically quarantines, deletes, moves, renames, or opens a suspicious file.
- Security credentials and generated scanner runtimes remain private runtime state outside Git. The optional abuse.ch community Auth-Key is stored owner-only under the Nougat user config tree.
- Automatic P2P scanning and manual Virus Scan use the same evidence/reporting engine and the worker terminates after the requested scan finishes.

### v0.0.21 identity and palette rules

- Official visible application identity is **Nougat Media Suite**; historical ReddMedia identity ended with accepted v0.0.20.
- Root executable: `Nougat_Media_Suite_v21`.
- Former top-level Nougat tab label: **Search**.
- Common suite chrome: chocolate/cocoa/cream/caramel with the approved N + play icon.
- Video Player: chocolate/cocoa/caramel; Library: forest/sage; Discover: plum/lavender; Search: cocoa/nougat/caramel; Debug: graphite/amber. P2P may retain a navy/ice sub-surface inside Search.
- Stream retains only YouTube, Rumble, RuTube, VK, and OK in v0.0.21; selecting one changes Stream to that service's recognizable palette.
- Additional Stream services and other post-rebrand UI/feature work are deferred to v0.0.23 after the v0.0.22 licensing release. The approved v0.0.21 UI repairs are the Search/P2P navigation consolidation and working Library view-icon controls.
- v0.0.21 does not rename the Git working directory or migrate existing user data/config paths.

### v0.0.21 Library view-control rule

- The root Library heading is followed by two compact icon controls: three horizontal lines for List and a 2x2 four-square symbol for Grid.
- These controls must change the actual Library presentation when clicked; active state is indicated by the button treatment, never by `Grid [x]` or `List [x]` text.
- Movies and TV retain independent persisted view choices.

### retained v0.0.20 behavior rules

- Video Player volume defaults to 100%, ranges through 200%, and shows live value plus 100% marker.
- Compact bottom controls center when width permits and remain wheel-scrollable when narrow.
- Movies and TV independently persist Grid/List Library preferences.
- Custom editable text fields show focus/caret state.
- Default Play remains the native Nougat Media Suite player.

### v0.0.23 exact concept UI rules

- The owner-uploaded Nougat Media Suite concept sheet is the canonical visual authority for the v0.0.23 UI treatment. Approximate alternate themes are not substitutes.
- The established top-level layout remains `Video Player | Library | Discover | Search | Stream | Debug`; styling may not reorder or replace those tabs without explicit owner approval.
- The selected top-level tab uses the integrated downward point/notch shown in the concept sheet.
- The established Video Player control order remains `Open | Rewind 10s | Play/Pause | Stop | Fast Forward 10s | Fullscreen`.
- The common page material is the approved cream quilted surface, with only subtle owner-approved area tinting.
- Seek and volume controls use the concept-sheet caramel/cream/chocolate palette; the old red fill is not part of the Nougat v0.0.23 theme.
- Volume remains 0-200% with a visible 100% marker and uses the compact concept-sheet geometry.
- The active icon is the exact owner-approved square chocolate/caramel N emblem extracted from the concept sheet; the former candy-filled N icon is no longer active identity.
- Stream retains YouTube, Rumble, RuTube, VK, and OK. Stream uses one shared Direct Play URL field and one native playback action named Direct Watch; the redundant Stream Play button is removed.
- Additional Stream services, Web Player, Plex integration, or other feature expansion require separate owner approval.
## 19. v0.0.24 Search-page polish law

- Search-page polish is scoped to the existing Search area and must not change decentralized-search engine behavior without separate owner approval.
- The suite header uses the approved N emblem at the far left with `NOUGAT MEDIA SUITE` immediately beside it; the version/server area does not carry a duplicate N.
- Search's internal `Search | Crawler | P2P | Virus Scan` tabs use the approved concept-sheet control family and selected-tab point/notch.
- `Network...` and `SEARCH` share the same right-side alignment and width.
- Search fields, results, peer lists, crawl logs, and embedded P2P surfaces use the approved cream/caramel/chocolate concept family rather than the legacy flat dark slab.
- The GNOME launcher/running-window identity must resolve to the approved Nougat N, not a generic gear fallback.

## 20. v0.0.25 persistent selection, Stream theme, and Discover playback law

- Persistent selector-style choices use the concept-sheet downward point/notch to expose current state. Momentary action buttons do not retain a selected notch.
- Independent selector groups may show independent active notches simultaneously. In Discover, `Usual | Random` is one group and `Local Movie | Local TV | External Movie | External TV` is a second group.
- Within Stream, the selected provider drives the Stream interior palette and the tint applied to the exact accepted quilt material: YouTube red, Rumble green, RuTube purple, VK blue, and OK orange/caramel. The top-level Stream tab may retain its suite-level blue identity.
- Stream provider selection must be visible both by its provider color and by the downward active notch.
- Local Discover `Play in Nougat...` must resolve the recommendation through the real Jellyfin catalog to an actual playable local movie or episode and must use the native Nougat player.
- A local TV series-level recommendation resolves to a real episode. If private local viewing history identifies a matching most-recently watched episode, use it; otherwise start with the first real episode in season/episode order.
- A failed native-player start remains an explicit failure state; it must not silently switch to an external player or pretend playback started.


### v0.0.26 durable interaction laws
- Mouse side buttons map to Nougat internal navigation history: Button 8 = Back and Button 9 = Forward.
- Fixed header identity/status elements (N/name, Server status dot, version) remain anchored while the top tab strip scrolls in the foreground over them.
- The Video Player volume control remains a deliberate 0-200% gain control. 100% is normal level; 101-200% remains available for quiet media even if amplification can distort.
- TV episode completion must never silently dead-end when a next episode can be resolved. Nougat shows an Up Next overlay with a visible 10-second countdown plus Play Next, Back to Series, and Replay.
- Diagnostic Green means a check returned healthy evidence. Unknown means the check could not establish evidence and must never be promoted to Green by assumption. Diagnostic exports redact credentials, tokens, authorization headers, cookies, passwords, and API keys.


### v0.0.33 viewport, security, P2P Plus, and Live TV law

- Every normal page and internal tab uses a hard content viewport/border so scrolling content cannot paint outside its lane. **Video Player is explicitly excluded and retains its accepted v0.0.32 presentation.**
- The top navigation is hard-clipped between fixed Nougat branding and fixed Server/version chrome.
- Security Analysis must report `ANALYSIS INCOMPLETE` when a required/relevant engine did not complete; it must never convert engine absence into a clean result or use the word `Safe` as a verdict. WARN ME FIRST and no automatic quarantine/delete/move/rename remain absolute.
- Third-party security, torrent, server, tuner, codec, extraction, and other borrowed systems must remain behind Nougat-owned interfaces where practical so they can be replaced without rewriting product behavior.
- Live TV is a first-class top-level page. v0.0.33 may truthfully discover/probe Linux DVB/V4L2 hardware and establish channel/guide/timeshift/recording interfaces, but must not claim actual tuning or playback until proven on owner hardware. The Hauppauge WinTV-HVR-955Q is the first hardware target; HDHomeRun and ATSC 3.0 are later adapters.


### v0.0.34 exact-sheet navigation/player-control law
- The owner-approved Nougat UI concept sheet is the literal authority for the global top tabs, seek bar, and volume control. Do not substitute pill-button approximations for the top tabs.
- Top tabs retain page-specific colors but use the sheet's tab geometry, bevel/inset treatment, tight spacing, and selected downward pointer.
- The scrollable top-tab lane begins close to the `NOUGAT MEDIA SUITE` brand; the fixed right Server/status/version block is not moved by this repair.
- The sheet seek component governs track/knob/timestamp presentation. The sheet volume component governs the housed control, speaker glyphs, track/knob, and percentage placement while Nougat retains its functional 0-200% volume range.
- Home card geometry is section-defined, never media-item-defined: Continue Watching uses one landscape template; LOCAL recommendations use one portrait template.
- Discover source names must describe the actual backend. TMDb-backed discovery is labeled `TMDb Movie` and `TMDb TV`; Live TV is its own source selector.
