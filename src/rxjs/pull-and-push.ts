import {Options, prepareDOM, Source} from "../tools";
import {Observable} from "rxjs";

import { print } from '../tools'

interface Actors<P, C> { producer: P, consumer: C }

const OPTIONS: Options = {
    header: 'Pull and Push-systems to values delivery',
    buttons: [
        { id: 'pull-single', caption: 'pull single' },
        { id: 'pull-multiply', caption: 'pull multiply' },
        { id: 'push-single', caption: 'push single' },
        { id: 'push-multiply', caption: 'push multiply' },
        { id: 'rxjs-observable', caption: 'rxjs observable' }
    ]
}
prepareDOM(OPTIONS)

{ //pull single
    const actors: Actors<() => string, (source: Source, value: any) => void> = {
        producer: function () {
            return 'pull single'
        },
        consumer: print
    }

    document.getElementById(
        OPTIONS.buttons[0].id
    ).addEventListener(
        'click',
        _ => {
            console.group()
            actors.consumer('Native', actors.producer())
        }
    )
}

{ //pull multiply
    function* fooGen() {
        yield 'pull multiply 1'
        yield 'pull multiply 2'
        yield 'pull multiply 3'
        yield 'pull multiply 4'

        return 'complete'
    }

    const actors: Actors<Iterator<string>, (source: Source, value: any) => void> = {
        producer: fooGen(),
        consumer: print
    }

    let firstValue = true
    document.getElementById(
        OPTIONS.buttons[1].id
    ).addEventListener(
        'click',
        _ => {
            firstValue && console.group()
            actors.consumer('Native', actors.producer.next().value)

            firstValue = false
        }
    )
}

{ //push single
    async function fooProm() {
        return new Promise<string>(resolve => setTimeout(_ => resolve('push single'), 2000))
    }

    document.getElementById(
        OPTIONS.buttons[2].id
    ).addEventListener(
        'click',
        _ => {
            const actors: Actors<Promise<string>, (source: Source, value: any) => void> = {
                producer: fooProm(),
                consumer: print
            }

            console.group()
            actors.consumer('Native', 'waiting value...')

            actors.producer.then(value => actors.consumer('Native', value))
        }
    )
}

{ //push multiply
    async function* fooGenProm() {
        yield new Promise(resolve => setTimeout(_ => resolve('push multiply 1'), 3000))
        yield new Promise(resolve => setTimeout(_ => resolve('push multiply 2'), 1000))
        yield new Promise(resolve => setTimeout(_ => resolve('push multiply 3'), 5000))
        yield new Promise(resolve => setTimeout(_ => resolve('push multiply 4'), 2000))

        return 'complete'
    }

    document.getElementById(
        OPTIONS.buttons[3].id
    ).addEventListener(
        'click',
        _ => {
            const actors: Actors<AsyncIterator<unknown, string, unknown>, (source: Source, value: any) => void> = {
                producer: fooGenProm(),
                consumer: print
            }

            const start = function getNext(producer) {
                producer.next().then(next => {
                    actors.consumer('Native', next.value)

                    if (!next.done) {
                        getNext(producer)
                    }
                })
            }

            console.group()
            actors.consumer('Native', 'waiting values...')

            start(actors.producer)
        }
    )
}

{ // rxjs observable
    document.getElementById(
        OPTIONS.buttons[4].id
    ).addEventListener(
        'click',
        _ => {
            const actors: Actors<Observable<string>, (source: Source, value: any) => void> = {
                producer: new Observable(observer => {
                    observer.next('value 1')
                    observer.next('value 2')
                    observer.next('value 3')
                    setTimeout(_ => {
                        observer.next('value 4 (async)')
                        observer.complete()
                    }, 2000)

                }),
                consumer: print
            }

            console.group()
            actors.consumer('RxJS', 'waiting values...')
            actors.producer.subscribe({
                next: value => actors.consumer('RxJS', value),
                error: error => print('RxJS', `ERROR ${error}`),
                complete: () => print('RxJS', 'complete')
            })
        }
    )
}
