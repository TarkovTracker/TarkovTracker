import { fireapp, fireuser } from '@/plugins/firebase'
import { doc, onSnapshot, getFirestore, setDoc } from "firebase/firestore";
import { debounce, set, get } from 'lodash-es'

const db = getFirestore(fireapp)

function parseDoc(docString) {
  return doc(db, docString.replace('{uid}', fireuser?.uid))
}

export function PiniaFirestore(context) {
  // If the firestore option in defineStore exists, try binding to a firestore document
  if (context.store.firestore) {
    // Loop through each firestore setting in the array
    context.store.firestore.forEach((firestoreSetting) => {
      if (firestoreSetting.document) {
        // Add the binding 
        context.store.firebind = function() {
          // Bind the store to a snapshot from the options
          context.options.firestore.unsubscribe = onSnapshot(
            parseDoc(firestoreSetting.document), 
            (snapshot) => {
              // Create a lock on the store to not trigger re-writes
              context.options.firestore.lock = true
    
              // Update the store with the snapshot
              const data = snapshot.data() || {}
    
              // Check if we have a path set, or if we default to the root
              if (firestoreSetting.path && firestoreSetting.path !== '.') {
                // Set the store to the path
                set(context.store.$state, firestoreSetting.path, data)
              } else {
                // Set the store to the root
                context.store.$state = data
              }
    
              // Release the lock on the store
              context.options.firestore.lock = false
          },  () => {
            // An error occurred trying to obtain the snapshot (or getting the latest)
          })
        }
      
        context.store.fireunbind = function() {
          if (typeof context.options.firestore.unsubscribe === "function") { 
            context.options.firestore.unsubscribe()
          }
        }
    
        // Debounced function to update the firestore document a maximum of once every 250ms
        const uploadDocument = debounce(function (state) {
          setDoc(parseDoc(firestoreSetting.document), state)
        }, firestoreSetting.debouncems || 250)
    
        // eslint-disable-next-line no-unused-vars
        context.store.$subscribe(function (mutation, state) {
          // Update the related document when the state changes
          if (typeof context.options.firestore.unsubscribe != 'undefined' && !context.options.firestore.lock) {
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