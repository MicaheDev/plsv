<template>
    <div class="w-full h-svh flex flex-col overflow-hidden">
        <header class="w-full h-15 shrink-0 flex items-center">
            <div class="w-full max-w-2xl flex mx-auto items-center justify-between px-4 gap-4">

                <div class="inline-flex items-center gap-2">
                    <img src="/logo.png" class="w-10" />
                    <h1 class="font-black">LinguSeñas</h1>
                </div>
                <div class="inline-flex items-center gap-2">

                    <img src="/ue.png" class="w-10" />
                    <img src="/uptpc.png" class="w-15" />
                </div>

            </div>
        </header>
        <main class="w-full h-full flex-1 overflow-y-auto max-w-2xl mx-auto">
            <slot></slot>
        </main>

    </div>
</template>s