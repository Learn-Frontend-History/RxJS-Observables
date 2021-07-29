import {Options, prepareDOM, print} from "../tools";
import {Observable} from "rxjs";

const OPTIONS: Options = {
    header: 'Observable is lazy as functions',
    buttons: [
        { id: 'lazy-function', caption: 'lazy function' },
        { id: 'lazy-observable', caption: 'lazy observable' },
    ]
}
prepareDOM(OPTIONS)

interface Actors<P, C> { producer: P, consumer: C }

{ //lazy function
    const actors: Actors<() => void, (value: any) => void> = {
        producer: () => 'lazy computations value from function',
        consumer: print.bind(null, ['Native'])
    }

    document.getElementById(
        OPTIONS.buttons[0].id
    ).addEventListener(
        'click',
        _ => {
            console.group()
            actors.consumer(actors.producer())
        }
    )
}

{ //lazy observable
    const actors: Actors<Observable<string>, (value: any) => void> = {
        producer: new Observable(
            observer => observer.next('lazy computations value from Observable')
        ),
        consumer: print.bind(null, ['RxJS'])
    }

    document.getElementById(
        OPTIONS.buttons[1].id
    ).addEventListener(
        'click',
        _ => {
            console.group()
            actors.producer.subscribe(actors.consumer)
        }
    )
}
