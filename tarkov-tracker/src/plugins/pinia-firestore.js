import { fireapp, fireuser } from '@/plugins/firebase'
import { doc, onSnapshot, getFirestore, setDoc } from "firebase/firestore";
import { debounce, set, get } from 'lodash-es'

const db = getFirestore(fireapp)

// Replace template variables in the doc path like user ID
// Replace {uid} with the current user's uid
function parseDoc(docString) {
  return doc(db, docString.replace('{uid}', fireuser?.uid))
}

export function PiniaFirestore(context) {
  // If the firestore option in defineStore exists, try binding to a firestore document
  if (context.options.firestore) {
    // Loop through each firestore setting in the array
    context.options.firestore.forEach((firestoreSetting, fsIndex) => {
      console.log('firestoreSetting', firestoreSetting)
      if (firestoreSetting.document) {
        console.log('firestoreSetting.document', firestoreSetting.document)
        // Add the binding 
        if (context.store.firebind === undefined) {
          context.store.firebind = {}
        }
        context.store.firebind[fsIndex] = function() {
          // Bind the store to a snapshot from the options
          console.log("Binding to firestore document: " + firestoreSetting.document)
          context.options.firestore[fsIndex].unsubscribe = onSnapshot(
            parseDoc(firestoreSetting.document), 
            (snapshot) => {
              // Create a lock on the store to not trigger re-writes
              context.options.firestore[fsIndex].lock = true
    
              // Update the store with the snapshot
              const data = snapshot.data() || {}
    
              // Check if we have a path set, or if we default to the root
              if (firestoreSetting.path && firestoreSetting.path !== '.') {
                // Set the store to the path
                set(context.store.$state, firestoreSetting.path, data)
              } else {
                // Clear the store, then set each key in data into the store
                Object.keys(context.store.$state).forEach((key) => {
                  delete context.store.$state[key]
                })
                Object.keys(data).forEach((key) => {
                  context.store.$state[key] = data[key]
                })
              }
    
              // Release the lock on the store
              context.options.firestore[fsIndex].lock = false
          },  () => {
            // An error occurred trying to obtain the snapshot (or getting the latest)
          })
        }
        // Update firebindAll to call all firebinds)
        context.store.firebindAll = function () {
          Object.keys(context.store.firebind).forEach((key) => {
            context.store.firebind[key]()
          })
        }
      
        // Add the unbinding
        if (context.store.fireunbind === undefined) {
          context.store.fireunbind = {}
        }
        context.store.fireunbind[fsIndex] = function() {
          if (typeof context.options.firestore.unsubscribe === "function") { 
            context.options.firestore[fsIndex].unsubscribe()
            context.options.firestore[fsIndex].unsubscribe = undefined
          }
        }
        // Update fireunbindAll to call all fireunbinds
        context.store.fireunbindAll = function () {
          Object.keys(context.store.fireunbind).forEach((key) => {
            context.store.fireunbind[key]()
          })
        }
    
        // Debounced function to update the firestore document a maximum of once every 250ms
        const uploadDocument = debounce(function (state) {
          setDoc(parseDoc(firestoreSetting.document), state)
        }, firestoreSetting.debouncems || 250)
    
        // eslint-disable-next-line no-unused-vars
        context.store.$subscribe(function (mutation, state) {
          // Update the related document when the state changes
          if (typeof context.options.firestore[fsIndex].unsubscribe != 'undefined' && !context.options.firestore[fsIndex].lock) {
            // Get the path of the state that we care about for this subscription
            if (firestoreSetting.path && firestoreSetting.path !== '.') {
              uploadDocument(get(state, firestoreSetting.path))
            } else {
              uploadDocument(state)
            }
          }
        })
      }
    })
  }
  
}