import { toRef } from "vue";
import { fireapp, fireuser } from "@/plugins/firebase";
import { doc, onSnapshot, getFirestore, setDoc } from "firebase/firestore";
import { debounce, set, get } from "lodash-es";
import { useDocument } from "vuefire";

const db = getFirestore(fireapp);

// Replace template variables in the doc path like user ID
// Replace {uid} with the current user's uid
function parseDoc(docString) {
  return doc(db, docString.replace("{uid}", fireuser?.uid));
}

export function PiniaFireswap(context) {
  // If the firestore option in defineStore exists, try binding to a firestore document
  if (context.options.fireswap) {
    // Loop through each firestore setting in the array
    context.options.fireswap.forEach((fireswapSetting, fsIndex) => {
      console.debug("fireswapSetting", fireswapSetting);
      if (fireswapSetting.document && fireswapSetting.localKey) {
        // Create a default state for the fireswap setting
        if (fireswapSetting.path && fireswapSetting.path !== ".") {
          context.options.fireswap[fsIndex].defaultState = JSON.stringify(
            get(context.store.$state, fireswapSetting.path)
          );
        } else {
          context.options.fireswap[fsIndex].defaultState = JSON.stringify(
            context.store.$state
          );
        }

        // Create a function to load the local storage version
        context.options.fireswap[fsIndex].loadLocal = function () {
          // Set a lock to prevent a subscribe mutation from firing while we load
          context.options.fireswap[fsIndex].lock = true;
          console.debug("Set lock to true on loadLocal for fireswap", fsIndex);
          if (
            localStorage.getItem(context.options.fireswap[fsIndex].localKey)
          ) {
            console.debug(
              "Loading local version of " +
              context.options.fireswap[fsIndex].localKey
            );
            // Load the localstorage version of the store
            const localStore = JSON.parse(
              localStorage.getItem(context.options.fireswap[fsIndex].localKey)
            );
            // Set the path to the local store version
            if (
              context.options.fireswap[fsIndex].path &&
              context.options.fireswap[fsIndex].path !== "."
            ) {
              set(
                context.store.$state,
                context.options.fireswap[fsIndex].path,
                localStore
              );
            } else {
              // Set each key individually to avoid breaking reactivity
              Object.keys(context.store.$state).forEach((key) => {
                context.store.$patch({ [key]: undefined });
              });
              Object.keys(localStore).forEach((key) => {
                context.store.$patch({ [key]: localStore[key] });
              });
            }
          } else {
            // Set the path to the default state
            if (
              context.options.fireswap[fsIndex].path &&
              context.options.fireswap[fsIndex].path !== "."
            ) {
              set(
                context.store.$state,
                context.options.fireswap[fsIndex].path,
                {}
              );
            } else {
              // Set the store to default state
              try {
                context.store.$reset();
              } catch (error) {
                // If we can't reset the store, set it to the defaultState we captured at plugin load
                const defaultState = JSON.parse(
                  context.options.fireswap[fsIndex].defaultState
                );
                Object.keys(context.store.$state).forEach((key) => {
                  context.store.$patch({ [key]: undefined });
                });
                Object.keys(defaultState).forEach((key) => {
                  context.store.$patch({ [key]: defaultState[key] });
                });
              }
            }
          }
          // Remove the lock
          console.debug("Set lock to false on loadLocal for fireswap", fsIndex);
          context.options.fireswap[fsIndex].lock = false;
        };
        // Run the loadLocal function at startup
        context.options.fireswap[fsIndex].loadLocal();

        // Add the binding
        if (typeof context.store.firebind == "undefined") {
          context.store.firebind = {};
        }
        context.store.firebind[fsIndex] = function () {
          // Bind the store to a snapshot from the options
          console.debug(
            "Binding to firestore document: " + fireswapSetting.document
          );
          context.options.fireswap[fsIndex].unsubscribe = onSnapshot(
            parseDoc(fireswapSetting.document),
            (snapshot) => {
              // Create a lock on the store to not trigger re-writes
              context.options.fireswap[fsIndex].lock = true;

              // Update the store with the snapshot
              const data = snapshot.data() || {};

              // Check if we have a path set, or if we default to the root
              if (fireswapSetting.path && fireswapSetting.path !== ".") {
                // Set the store to the path
                set(context.store.$state, fireswapSetting.path, data);
              } else {
                // Clear the store, then set each key in data into the store
                Object.keys(context.store.$state).forEach((key) => {
                  context.store.$patch({ [key]: undefined });
                });
                Object.keys(data).forEach((key) => {
                  context.store.$patch({ [key]: data[key] });
                });
              }

              // Release the lock on the store
              context.options.fireswap[fsIndex].lock = false;
            },
            (error) => {
              console.error(
                "Error binding to firestore document: " +
                fireswapSetting.document,
                error
              );
              // An error occurred trying to obtain the snapshot (or getting the latest)
            }
          );
        };
        // Update firebindAll to call all firebinds)
        context.store.firebindAll = function () {
          Object.keys(context.store.firebind).forEach((key) => {
            context.store.firebind[key]();
          });
        };

        // Add the unbinding
        if (context.store.fireunbind === undefined) {
          context.store.fireunbind = {};
        }
        context.store.fireunbind[fsIndex] = function () {
          if (
            typeof context.options.fireswap[fsIndex].unsubscribe === "function"
          ) {
            context.options.fireswap[fsIndex].unsubscribe();
            context.options.fireswap[fsIndex].unsubscribe = undefined;
            // Load the local storage version of the store
            context.options.fireswap[fsIndex].loadLocal();
          }
        };
        // Update fireunbindAll to call all fireunbinds
        context.store.fireunbindAll = function () {
          Object.keys(context.store.fireunbind).forEach((key) => {
            context.store.fireunbind[key]();
          });
        };

        // Debounced function to update the firestore document a maximum of once every 250ms
        const uploadDocument = debounce(function (state) {
          // Get rid of any undefined values via stringify+parse
          const stateCopy = JSON.parse(JSON.stringify(state));
          setDoc(parseDoc(fireswapSetting.document), stateCopy).catch((e) => {
            console.error("Error updating document: ", e);
          });
        }, fireswapSetting.debouncems || 250);

        context.store.$subscribe(function (mutation, state) {
          // Update the related document when the state changes
          if (
            typeof context.options.fireswap[fsIndex].unsubscribe !=
            "undefined" &&
            !context.options.fireswap[fsIndex].lock
          ) {
            // Get the path of the state that we care about for this subscription
            if (fireswapSetting.path && fireswapSetting.path !== ".") {
              uploadDocument(get(state, fireswapSetting.path));
            } else {
              // If no path is set, or if it is set to '.', then upload the entire state
              uploadDocument(state);
            }
          } else if (
            typeof context.options.fireswap[fsIndex].unsubscribe ==
            "undefined" &&
            !context.options.fireswap[fsIndex].lock
          ) {
            // If we're not bound, then update local storage instead
            // If the path is . then we're updating based on the root of the store
            console.debug(context.options.fireswap[fsIndex].lock);
            if (fireswapSetting.path && fireswapSetting.path !== ".") {
              localStorage.setItem(
                fireswapSetting.localKey,
                JSON.stringify(get(state, fireswapSetting.path))
              );
            } else {
              localStorage.setItem(
                fireswapSetting.localKey,
                JSON.stringify(state)
              );
            }
          }
        });
      } else {
        console.error(
          context.name,
          "fireswap requires a document and localKey"
        );
      }
    });
  }
}

// export function PiniaFireswap(context) {
//   // If the firestore option in defineStore exists, try binding to a firestore document
//   if (context.options.fireswap) {
//     // Loop through each firestore setting in the array
//     context.options.fireswap.forEach((fireswapSetting, fsIndex) => {
//       console.debug('fireswapSetting', fireswapSetting)
//       if (fireswapSetting.document && fireswapSetting.localKey) {
//         // Create a default state for the fireswap setting
//         if (fireswapSetting.path && fireswapSetting.path !== '.') {
//           context.options.fireswap[fsIndex].defaultState = JSON.stringify(get(context.store.$state, fireswapSetting.path))
//         } else {
//           context.options.fireswap[fsIndex].defaultState = JSON.stringify(context.store.$state)
//         }

//         // Create a function to load the local storage version
//         context.options.fireswap[fsIndex].loadLocal = function () {
//           // Set a lock to prevent a subscribe mutation from firing while we load
//           context.options.fireswap[fsIndex].lock = true
//           console.debug('Set lock to true on loadLocal for fireswap', fsIndex)
//           if (localStorage.getItem(context.options.fireswap[fsIndex].localKey)) {
//             console.debug("Loading local version of " + context.options.fireswap[fsIndex].localKey)
//             // Load the localstorage version of the store
//             const localStore = JSON.parse(localStorage.getItem(context.options.fireswap[fsIndex].localKey))
//             // Set the path to the local store version
//             if (context.options.fireswap[fsIndex].path && context.options.fireswap[fsIndex].path !== '.') {
//               set(context.store.$state, context.options.fireswap[fsIndex].path, localStore)
//             } else {
//               // Set each key individually to avoid breaking reactivity
//               Object.keys(context.store.$state).forEach((key) => {
//                 context.store.$patch({ [key]: undefined })
//               })
//               Object.keys(localStore).forEach((key) => {
//                 context.store.$patch({ [key]: localStore[key] })
//               })
//             }
//           } else {
//             // Set the path to the default state
//             if (context.options.fireswap[fsIndex].path && context.options.fireswap[fsIndex].path !== '.') {
//               set(context.store.$state, context.options.fireswap[fsIndex].path, {})
//             } else {
//               // Set the store to default state
//               try {
//                 context.store.$reset()
//               } catch (error) {
//                 // If we can't reset the store, set it to the defaultState we captured at plugin load
//                 const defaultState = JSON.parse(context.options.fireswap[fsIndex].defaultState)
//                 Object.keys(context.store.$state).forEach((key) => {
//                   context.store.$patch({ [key]: undefined })
//                 })
//                 Object.keys(defaultState).forEach((key) => {
//                   context.store.$patch({ [key]: defaultState[key] })
//                 })
//               }
//             }
//           }
//           // Remove the lock
//           console.debug('Set lock to false on loadLocal for fireswap', fsIndex)
//           context.options.fireswap[fsIndex].lock = false
//         }
//         // Run the loadLocal function at startup
//         context.options.fireswap[fsIndex].loadLocal()

//         // Add the binding
//         if (typeof context.store.firebind == 'undefined') {
//           context.store.firebind = {}
//         }
//         context.store.firebind[fsIndex] = function () {
//           // Bind the store to a snapshot from the options
//           console.debug("Binding to firestore document: " + fireswapSetting.document)
//           const { stop } = useDocument(parseDoc(fireswapSetting.document), { target: context.store.$state, reset: () => { console.log("We stopped listening to the pinia firestore!") } })
//           context.options.fireswap[fsIndex].unsubscribe = stop
//           // context.options.fireswap[fsIndex].unsubscribe = onSnapshot(
//           //   parseDoc(fireswapSetting.document),
//           //   (snapshot) => {
//           //     // Create a lock on the store to not trigger re-writes
//           //     context.options.fireswap[fsIndex].lock = true

//           //     // Update the store with the snapshot
//           //     const data = snapshot.data() || {}

//           //     // Check if we have a path set, or if we default to the root
//           //     if (fireswapSetting.path && fireswapSetting.path !== '.') {
//           //       // Set the store to the path
//           //       set(context.store.$state, fireswapSetting.path, data)
//           //     } else {
//           //       // Clear the store, then set each key in data into the store
//           //       Object.keys(context.store.$state).forEach((key) => {
//           //         context.store.$patch({ [key]: undefined })
//           //       })
//           //       Object.keys(data).forEach((key) => {
//           //         context.store.$patch({ [key]: data[key] })
//           //       })
//           //     }

//           //     // Release the lock on the store
//           //     context.options.fireswap[fsIndex].lock = false
//           //   }, (error) => {
//           //     console.error(error)
//           //     // An error occurred trying to obtain the snapshot (or getting the latest)
//           //   })
//         }
//         // Update firebindAll to call all firebinds)
//         context.store.firebindAll = function () {
//           Object.keys(context.store.firebind).forEach((key) => {
//             context.store.firebind[key]()
//           })
//         }

//         // Add the unbinding
//         if (context.store.fireunbind === undefined) {
//           context.store.fireunbind = {}
//         }
//         context.store.fireunbind[fsIndex] = function () {
//           if (typeof context.options.fireswap[fsIndex].unsubscribe === "function") {
//             context.options.fireswap[fsIndex].unsubscribe()
//             context.options.fireswap[fsIndex].unsubscribe = undefined
//             // Load the local storage version of the store
//             context.options.fireswap[fsIndex].loadLocal()
//           }
//         }
//         // Update fireunbindAll to call all fireunbinds
//         context.store.fireunbindAll = function () {
//           Object.keys(context.store.fireunbind).forEach((key) => {
//             context.store.fireunbind[key]()
//           })
//         }

//         // Debounced function to update the firestore document a maximum of once every 250ms
//         const uploadDocument = debounce(function (state) {
//           // Get rid of any undefined values via stringify+parse
//           const stateCopy = JSON.parse(JSON.stringify(state))
//           setDoc(parseDoc(fireswapSetting.document), stateCopy).catch(e => {
//             if (e.message == 'PERMISSION_DENIED: No matching allow statements') {
//               // This means this is a read-only document, so we can ignore the error and assume the document is otherwise working fine
//             } else {
//               console.error("Error updating document: ", e)
//             }
//           })
//         }, fireswapSetting.debouncems || 250)

//         context.store.$subscribe(function (mutation, state) {
//           // Update the related document when the state changes
//           if (typeof context.options.fireswap[fsIndex].unsubscribe != 'undefined' && !context.options.fireswap[fsIndex].lock) {
//             // Get the path of the state that we care about for this subscription
//             if (fireswapSetting.path && fireswapSetting.path !== '.') {
//               uploadDocument(get(state, fireswapSetting.path))
//             } else {
//               // If no path is set, or if it is set to '.', then upload the entire state
//               uploadDocument(state)
//             }
//           } else if (typeof context.options.fireswap[fsIndex].unsubscribe == 'undefined' && !context.options.fireswap[fsIndex].lock) {
//             // If we're not bound, then update local storage instead
//             // If the path is . then we're updating based on the root of the store
//             console.debug(context.options.fireswap[fsIndex].lock)
//             if (fireswapSetting.path && fireswapSetting.path !== '.') {
//               localStorage.setItem(fireswapSetting.localKey, JSON.stringify(get(state, fireswapSetting.path)))
//             } else {
//               localStorage.setItem(fireswapSetting.localKey, JSON.stringify(state))
//             }
//           }
//         })
//       } else {
//         console.error(context.name, 'fireswap requires a document and localKey')
//       }
//     })
//   }
// }
