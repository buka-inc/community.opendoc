import { useDereferenceFn } from './use-dereference-fn'

export function useDereference<T> (o: MaybeRefOrGetter<Object | undefined>): [Ref<T | undefined>, Ref<string[]>] {
  const re = computed(() => toValue(o))

  const dereference = useDereferenceFn()

  const target = ref<T>()
  const paths = ref<string[]>([])

  watchEffect(() => {
    const v = re.value
    const [t, p] = dereference<T>(v)

    target.value = t
    paths.value = p
  })

  return [target, paths]
}
