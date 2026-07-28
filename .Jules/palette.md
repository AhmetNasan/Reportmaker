## 2025-05-15 - [Enter Key Support for Forms]
**Learning:** Users instinctively expect the 'Enter' key to submit forms, especially in authentication and modal contexts. In monolithic HTML applications lacking native `<form>` structures, explicit keyboard event handlers are necessary to meet this expectation and improve accessibility.
**Action:** Always check if primary input fields in modals or auth cards have keyboard submission support, and implement `onkeydown` handlers if native form submission is not utilized.
